---
title: Federated Execution
layout: docs
permalink: /docs/handbook/PERMALINK_LOCATION
oneline: "Federated Execution in Lingua Franca"
preamble: >
---

# Federated Execution

The LF program supports federated runtime and each LF program executes in each federate independently controlled by RTI. In [`net_common.h`](https://github.com/lf-lang/reactor-c/blob/main/core/federated/net_common.h), the message types for the federated Lingua Franca programs are implemented. Each message types are for the federate communicate with the RTI.

![](../../../../../img/federated_execution/Federated_model.png)

The protocol between the RTI and the federate is like below:
![](../../../../../img/federated_execution/RTI-Federate%20Protocol.png)

## **Startup**

### 1. Connecting RTI and Federates

In code generator, each federate attempts to connect with an RTI at the `IP address`. For example, it opens a TCP connection. The number of [`STARTING_PORT`](#`starting_port-15045u`) + `PORT_RANGE_LIMIT` will be the maximum number if it is successfully connected.

### 2. Sending ID information

- `MSG_TYPE_FED_IDS`: When TCP connection successfully opened, the federate sends this to RTI. This messages contains:

  1. **ID of this federate** within the federation
     - This is contained in the global variable `lf_my_fed_id` in the federate code which is initialized by the code generator.
  2. **Unique ID of the federation**
     - This is a **GUID** that is cerated at run time by the gernerated script tha launches the federation.

- If you launch the federates and the RTI **manually**, rather than using the script, then the fedreration ID is a **string** that is optionally given to the fereate on the command line when it is launched.

- `Unidentified Federation`: The federate will connect successfully only to an RTI that is given the **same** federation ID on its command line. If no ID is given on the command line, then the default ID **Unidentified Federation** will be used.

- [`MSG_TYPE_REJECT`](#MSG_TYPE_REJECT): The RTI will respond with this message if the federation IDs do not match and close the connection. At this point the federate will increment the port number and try again to find an RTI that matches.

- `MSG_TYPE_ACK`: When the federation IDs match, the RTI will respond with this message.

### 3. UDP port for Synchronization

- `MSG_TYPE_NEIGHBOR_STRUCTURE`: This message informs the RTI about connections between the federate itself and other federates where messages are routed through the RTI. (Currently, this only includes logical connections when the coordination is centralized.) This information is needed for the RTI to perform the centralized coordination. The burden is on the federates to inform the RTI about relevant connections.

- `MSG_TYPE_UDP_PORT`: RTI will send this message with the payload of `USHART_MAX` if the initial clock sychronization is disabled altogether.
  - **USHART_MAX**: **0** if only the initial clock synchronization is enabled, or a **port number for UDP communication** if runtime clock synchronization is enabled.

#### 3.1 **Clock synchronization**

- **Default**: The initial clock synchroniztion is "**Enabled**". But "**Disabled**" if the federate host is identical to that of the RTI (either no "**at**" clause is given for either or they both have exactly the same string).

- **Turning on/off**: Set the the clock-sync property of the target to off/on. Initial is the default value.

- **Initial clock synchronization**

  - Using TCP connection, the first step is to find an **initial offset** to the physical clock of the federate to make it better match the physical clock at the RTI.
  - `LF_CLOCK_SYNC_EXCHANGES_PER_INTERVAL` **times** of cycle will happen to account for network delay. The cycle is like as below:

    ![](../../../../../img/federated_execution/Connecting_RTI.png)

    - `MSG_TYPE_CLOCK_SYNC_T1`: RTI initiate clock synchronization. This is the payload of which is the **current physical clock** reading at the RTI.
    - `MSG_TYPE_CLOCK_SYNC_T2`: If it is received, the federate records the physical time.
    - `MSG_TYPE_CLOCK_SYNC_T3`: A reply message to RTI after "T2". It records the time (T3) at which this message has gone out.
      - Payload: Federate ID
    - `MSG_TYPE_CLOCK_SYNC_T4`: The RTI responds to "T3" with the payload of phsical time at which that response was sent.

  - "**T1**" and "**T4**": Taken from the pysical clock at the **RTI**.

  - "**T2**" and "**T3**": Taken from the pysical clock at the **federate**.

  - **`Round trip latency`** (on the conncetion to the RTI) = (T4 - T1) - (T3 - T2)

    - `L` (One-way trip latency) will be the half of this.

  - `E` (The estimated clock error) = L - (T2 - T1)
    - **The average value of E** becomes the `initial offset` for the clock at the federate. When `lf_time_physical()` is called, this offset will be added to whatever physical clock says.

#### 3.2 Starting Federate thread

- When the clock synchronization is enabled, the federate starts a thread to listen for incoming UDP messages from the RTI.

  ```sh
  -c on period <n>
  ```

  : With this command line argument, the RTI will initiate a clock synchronization round by sending to the federate a `MSG_TYPE_CLOCK_SYNC_T1` message.

#### 3.3 Estimating **the average clock synchronization error `E`**

- Including two **execptions**:

  1.  **A fraction of E** (given by `_LF_CLOCK_SYNC_ATTENUATION`) is used to adjust the offset up or down rather than just setting the offset equal to E.
  2.  `MSG_TYPE_CLOCK_SYNC_CODED_PROBE`: After `MSG_TYPE_CLOCK_SYNC_T4`, the RTI immediately sends this message.

- The federate measures the time difference between its receipt of "**T4**" and this "**code probe**" and compares that time difference against the time difference at the RTI (the difference between the two payloads).

- **Skipping case** of clock synchronization round:
  1. **(Difference between payloads) > |`CLOCK_SYNC_GUARD_BAND`|**
  2. If any of the **expected UDP messages fails** to arrive.

### 4. After synchronization, depends on the coordination type:

#### **Case 1**) **Decentralized** coordination parameter and **inbound connections** of federate

1. The federate starts a socket server to listen for incoming connections from other federates. It attempts to create the server at the port given by `STARTING_PORT`.

   - If it fails, it increments the port number from there until a port is available.

2. The federate sends `MSG_TYPE_ADDRESS_ADVERTISEMENT` message to RTI including the port number as a payload.

3. The federate then creates a **thread** to listen for incoming socket connections and messages.

#### **Case 2**) **Outbound conncections** to other federates

1. The federate establishes a socket connection to other federates by first sending of `MSG_TYPE_ADDRESS_QUERY` message to the RTI with the payload of the ID of the federate wishing to conncect to.

   - `-1` from the RTI: This means the RTI does not (yet) know the remote federate's port number and IP address. So, the local federate will try again after waiting `ADDRESS_QUERY_RETRY_INTERVAL`.

2. When the RTI gets a valid port number and IP address in reply, it will establish a socket conncetion to that remote federate.

- Physical connections also use the above P2P sockets between federates even if the coordination is centralized.
  - **Note**: Peer-to-peer sockets can be closed by the downstream federate. For example, when a downstream federate reaches its stop time, then it will stop accepting physical messages. To achieve an orderly shutdown, the downstream federate sends a `MSG_TYPE_CLOSE_REQUEST` message to the upstream one and the upstream federate handles closing the socket. This way, any messages that are in the middle of being sent while the downstream federate shuts down will successfully traverse the socket, even if only to be ignored by the downstream federate. It is valid to ignore such messages if the connection is physical or if the coordination is decentralized and the messages arrive after the STP offset of the downstream federate (i.e., they are "tardy").

### 5. Sharing Timestamp

- `MSG_TYPE_TIMESTAMP`:
  - Each federate reports a reading of its physical clock to the RTI by this message. Then the federates and the RTI can decide the common start time.
  - The RTI broadcasts **(the maximum of these readings) + `DELAY_START`** to all federates as the start time, again on this message.

## **Execution**

### 1. Taggged message depends on the coordination type:

#### **Case 1**) **Centralized** coordination

- `MSG_TYPE_NEXT_EVENT_TAG` (NET): Each federate sends this message to the RTI with the start tag. So, each federate can say that they have the valid event at the **start tag (start time, 0)** and inform the RTI of this event.
  - **Tag** is composed of time and microstep information.
- `MSG_TYPE_LOGICAL_TAG_COMPLETE`: Each federate sends this message at the conclusion of each tag.
- `MSG_TYPE_TAG_ADVANCE_GRANT` (TAG) and `MSG_TYPE_PROVISIONAL_TAG_ADVANCE_GRANT` (PTAG): Each federate would have to wait for one of these messages before it can advance to a particular tag.

  ![](../../../../../img/federated_execution/Message_sequence.png)

#### **Case 2**) **Decentralized** coordination

- The coordination is governed by STA and STAAs, as further explained in the paper, [Quantifying and Generalizing the CAP Theorem
  ](https://doi.org/10.48550/arXiv.2109.07771).

## **Shutdown**

For deterministic shutdown process, there is a fomulated logical consensus as following:

### 1. Ceasing to advance a federate's tag to stop the execution

### 2. Notifying the RTI

### 3. Asking an appropriate final tag

### 4. Picking the maximum tag

### 5. Sending the maximum tag to RTI

### 6. Events up to and including the maxium tag

## **Variables**

#### `TCP_TIMEOUT_TIME`

- The timeout time in ns for TCP operations.
- Default value is 10 secs.

  ```c
  #define TCP_TIMEOUT_TIME SEC(10)
  ```

#### `UDP_TIMEOUT_TIME`

- The timeout time in ns for UDP operations.
- Default value is 1 sec.

  ```c
  #define UDP_TIMEOUT_TIME SEC(1)
  ```

#### `FED_COM_BUFFER_SIZE`

- Size of the buffer used for messages sent between federates.
- This is used by both the federates and the RTI, so message lengths should generally match.

  ```c
  #define FED_COM_BUFFER_SIZE 256u
  ```

#### `CONNECT_RETRY_INTERVAL`

- Number of seconds that elapse between a federate's attempts to connect to the RTI.

  ```c
  #define CONNECT_RETRY_INTERVAL 2
  ```

#### `CONNECT_NUM_RETRIES`

- Bound on the number of retries to connect to the RTI.
- A federate will retry every `CONNECT_RETRY_INTERVAL` seconds this many times before giving up.
- E.g., 500 retries every 2 seconds results in retrying for about 16 minutes.

  ```c
  #define CONNECT_NUM_RETRIES 500
  ```

#### `ADDRESS_QUERY_RETRY_INTERVAL`

- Number of nanoseconds that a federate waits before asking the RTI again for the port and IP address of a federate (an MSG_TYPE_ADDRESS_QUERY message) after the RTI responds that it does not know.

  ```c
  #define ADDRESS_QUERY_RETRY_INTERVAL 100000000LL
  ```

#### `PORT_KNOCKING_RETRY_INTERVAL`

- Number of nanoseconds that a federate waits before trying another port for the RTI. This is to avoid overwhelming the OS and the socket with too many calls.

```c
#define PORT_KNOCKING_RETRY_INTERVAL 10000LL
```

#### `STARTING_PORT`

- Default starting port number for the RTI and federates' socket server.
- Unless a specific port has been specified by the LF program in the "at" for the RTI, when the federates start up, they will attempt to open a socket server on this port, and, if this fails, increment the port number and try again
- The number of increments is limited by `PORT_RANGE_LIMIT`.

  ```c
  #define STARTING_PORT 15045u
  ```

#### `PORT_RANGE_LIMIT`

- Number of ports to try to connect to.
- Unless the LF program specifies a specific port number to use, the RTI or federates will attempt to start a socket server on port `STARTING_PORT`. If that port is not available (e.g., another RTI is running or has recently exited), then it will try the next port, `STARTING_PORT`+1, and keep incrementing the port number up to this limit. If no port between `STARTING_PORT` and `STARTING_PORT + PORT_RANGE_LIMIT` is available, then the RTI or the federate will fail to start.
- This number, therefore, limits the number of RTIs and federates that can be simultaneously running on any given machine without assigning specific port numbers.

  ```c
  #define PORT_RANGE_LIMIT 1024
  ```

#### `DELAY_START`

- Delay the start of all federates by this amount.

  ```c
  DELAY_START SEC(1)
  ```

## **Message types**

These message types will be encoded in an **unsigned char**, so the magnitude must not exceed 255.
Note that these are listed in increasing numerical order starting from 0 interleaved with decreasing numerical order starting from 255 (so that they can be listed in a logical order here even as the design evolves).

#### `MSG_TYPE_REJECT`

- Byte identifying a rejection of the previously received message.
- The reason for the rejection is included as an additional byte (uchar).

  ```c
  #define MSG_TYPE_REJECT 0
  ```

#### `MSG_TYPE_ACK`

- Byte identifying an acknowledgment of the previously received message.
- This message carries no payload.

  ```c
  #define MSG_TYPE_ACK 255
  ```

#### `MSG_TYPE_UDP_PORT`

- Byte identifying an acknowledgment of the previously received `MSG_TYPE_FED_IDS` message sent by the RTI to the federate with a payload indicating the UDP port to use for clock synchronization.
- The next four bytes will be the port number for the UDP server, or 0 or USHRT_MAX if there is no UDP server. 0 means that initial clock synchronization is enabled, whereas `USHRT_MAX` mean that no synchronization should be performed at all.

  ```c
  #define MSG_TYPE_UDP_PORT 254
  ```

#### `MSG_TYPE_FED_IDS`

- Byte identifying a message from a federate to an RTI containing the federation ID and the federate ID.
  - The message contains, in this order:
    - One byte equal to MSG_TYPE_FED_IDS.
    - Two bytes (ushort) giving the federate ID.
    - One byte (uchar) giving the length N of the federation ID.
    - N bytes containing the federation ID.
- Each federate needs to have a unique ID between 0 and `NUMBER_OF_FEDERATES-1`.
- Each federate, when starting up, should send this message to the RTI.
- This is its first message to the RTI.
- The RTI will respond with either `MSG_TYPE_REJECT`, `MSG_TYPE_ACK`, or `MSG_TYPE_UDP_PORT`.
- If the federate is a C target LF program, the generated federate code does this by calling `synchronize_with_other_federates()`, passing to it its federate ID.

  ```c
  #define MSG_TYPE_FED_IDS 1
  ```

#### `MSG_TYPE_TIMESTAMP` and `MSG_TYPE_TIMESTAMP_LENGTH`

- Byte identifying a timestamp message, which is 64 bits long.
- Each federate sends its starting physical time as a message of this
- type, and the RTI broadcasts to all the federates the starting logical
- time as a message of this type.

  ```c
  #define MSG_TYPE_TIMESTAMP 2
  #define MSG_TYPE_TIMESTAMP_LENGTH (1 + sizeof(int64_t))
  ```

#### `MSG_TYPE_MESSAGE`

- Byte identifying a message to forward to another federate.

  - The next two bytes are the ID of the destination port (2 bytes).
  - The next two bytes are the destination federate ID.
  - The four bytes after that will be the length of the message.
  - The remaining bytes are the message.
  - NOTE: This is currently not used. All messages are tagged, even
  - on physical connections, because if "after" is used, the message
  - may preserve the logical timestamp rather than using the physical time.

  ```c
  #define MSG_TYPE_MESSAGE 3
  ```

#### `MSG_TYPE_RESIGN`

- Byte identifying that the federate is ending its execution.

  ```c
  #define MSG_TYPE_RESIGN 4
  ```

#### `MSG_TYPE_TAGGED_MESSAGE`

- Byte identifying a timestamped message to forward to another federate.
  - The next two bytes will be the ID of the destination reactor port.
  - The next two bytes are the destination federate ID.
  - The four bytes after that will be the length of the message.
  - The next eight bytes will be the timestamp of the message.
  - The next four bytes will be the microstep of the message.
  - The remaining bytes are the message.
- About coordination:

  - Centralized coordination: All such messages flow through the RTI.
  - Decentralized coordination: Tagged messages are sent peer-to-peer between federates and are marked with `MSG_TYPE_P2P_TAGGED_MESSAGE`.

  ```c
  #define MSG_TYPE_TAGGED_MESSAGE 5
  ```

#### `MSG_TYPE_NEXT_EVENT_TAG`

- Byte identifying a next event tag (NET) message sent from a federate in centralized coordination.
  - The next eight bytes will be the timestamp.
  - The next four bytes will be the microstep. This message from a federate tells the RTI the tag of the earliest event on that federate's event queue. In other words, absent any further inputs from other federates, this will be the least tag of the next set of reactions on that federate. If the event queue is empty and a timeout time has been specified, then the timeout time will be sent. If there is no timeout time, then `FOREVER` will be sent.
- Note that if there are physical actions and the earliest event on the event queue has a tag that is ahead of physical time (or the queue is empty), the federate should try to regularly advance its tag (and thus send NET messages) to make sure downstream federates can make progress.

  ```c
  #define MSG_TYPE_NEXT_EVENT_TAG 6
  ```

#### `MSG_TYPE_TAG_ADVANCE_GRANT`

- Byte identifying a time advance grant (TAG) sent by the RTI to a federate in centralized coordination.
- This message is a promise by the RTI to the federate that no later message sent to the federate will have a tag earlier than or equal to the tag carried by this TAG message.

  - The next eight bytes will be the timestamp.
  - The next four bytes will be the microstep.

    ```c
    #define MSG_TYPE_TAG_ADVANCE_GRANT 7
    ```

#### `MSG_TYPE_PROVISIONAL_TAG_ADVANCE_GRANT`

- Byte identifying a provisional time advance grant (PTAG) sent by the RTI to a federate in centralized coordination.
- This message is a promise by the RTI to the federate that no later message sent to the federate will have a tag earlier than the tag carried by this PTAG message.

  - The next eight bytes will be the timestamp.
  - The next four bytes will be the microstep.

  ```c
  #define MSG_TYPE_PROVISIONAL_TAG_ADVANCE_GRANT 8
  ```

#### `MSG_TYPE_LOGICAL_TAG_COMPLETE`

- Byte identifying a logical tag complete (LTC) message sent by a federate to the RTI.

  - The next eight bytes will be the timestep of the completed tag.
  - The next four bytes will be the microsteps of the completed tag.

  ```c
  #define MSG_TYPE_LOGICAL_TAG_COMPLETE 9
  ```

### **Messages used in `lf_request_stop()`**

#### **Overview of the algorithm**:

1. When any federate calls `lf_request_stop()`, it will send a `MSG_TYPE_STOP_REQUEST` message to the RTI, which will then forward a `MSG_TYPE_STOP_REQUEST` message to any federate that has not yet provided a stop time to the RTI.
2. The federates will reply with a `MSG_TYPE_STOP_REQUEST_REPLY` and a stop tag (which shall be the maximum of their current logical tag at the time they receive the` MSG_TYPE_STOP_REQUEST` and the tag of the stop request).
3. When the RTI has gathered all the stop tags from federates (that are still connected), it will decide on a common stop tag which is the maximum of the seen stop tag and answer with a `MSG_TYPE_STOP_GRANTED`.
4. The federate sending the `MSG_TYPE_STOP_REQUEST` and federates sending the `MSG_TYPE_STOP_REQUEST_REPLY` will freeze the advancement of tag until they receive the `MSG_TYPE_STOP_GRANTED` message, in which case they might continue their execution until the stop tag has been reached.

#### `MSG_TYPE_STOP_REQUEST`, `MSG_TYPE_STOP_REQUEST_LENGTH` and `ENCODE_STOP_REQUEST`

- Byte identifying a stop request. This message is first sent to the RTI by a federate that would like to stop execution at the specified tag. The RTI will forward the `MSG_TYPE_STOP_REQUEST` to all other federates. Those federates will either agree to the requested tag or propose a larger tag. The RTI will collect all proposed tags and broadcast the largest of those to all federates. All federates will then be expected to stop at the granted tag.
  - The next 8 bytes will be the timestamp.
  - The next 4 bytes will be the microstep.
- NOTE: The RTI may reply with a larger tag than the one specified in this message.
- It has to be that way because if any federate can send a `MSG_TYPE_STOP_REQUEST` message that specifies the stop time on all other federates, then every federate depends on every other federate and time cannot be advanced. Hence, the actual stop time may be nondeterministic.
- If, on the other hand, the federate requesting the stop is upstream of every other federate, then it should be possible to respect its requested stop tag.

  ```c
  #define MSG_TYPE_STOP_REQUEST 10
  #define MSG_TYPE_STOP_REQUEST_LENGTH (1 + sizeof(instant_t) + sizeof(microstep_t))
  #define ENCODE_STOP_REQUEST(buffer, time, microstep) do {
  buffer[0] = MSG_TYPE_STOP_REQUEST;
  encode_int64(time, &(buffer[1]));
  assert(microstep >= 0);
  encode_int32((int32_t)microstep, &(buffer[1 + sizeof(instant_t)]));
  } while(0)
  ```

#### `MSG_TYPE_STOP_REQUEST_REPLY`, `MSG_TYPE_STOP_REQUEST_REPLY_LENGTH` and `ENCODE_STOP_REQUEST_REPLY`

- Byte indicating a federate's reply to a MSG_TYPE_STOP_REQUEST that was sent by the RTI. The payload is a proposed stop tag that is at least as large as the one sent to the federate in a `MSG_TYPE_STOP_REQUEST` message.

  - The next 8 bytes will be the timestamp.
  - The next 4 bytes will be the microstep.

  ```c
  #define MSG_TYPE_STOP_REQUEST_REPLY 11
  #define MSG_TYPE_STOP_REQUEST_REPLY_LENGTH (1 + sizeof(instant_t) + sizeof(microstep_t))
  #define ENCODE_STOP_REQUEST_REPLY(buffer, time, microstep) do {
  buffer[0] = MSG_TYPE_STOP_REQUEST_REPLY;
  encode_int64(time, &(buffer[1]));
  assert(microstep >= 0);
  encode_int32((int32_t)microstep, &(buffer[1 + sizeof(instant_t)]));
  } while(0)
  ```

#### `MSG_TYPE_STOP_GRANTED`, `MSG_TYPE_STOP_GRANTED_LENGTH` and `ENCODE_STOP_GRANTED`

- Byte sent by the RTI indicating that the stop request from some federate has been granted. The payload is the tag at which all federates have agreed that they can stop.

  - The next 8 bytes will be the time at which the federates will stop. \*
  - The next 4 bytes will be the microstep at which the federates will stop.

  ```c
  #define MSG_TYPE_STOP_GRANTED 12
  #define MSG_TYPE_STOP_GRANTED_LENGTH (1 + sizeof(instant_t) + sizeof(microstep_t))
  #define ENCODE_STOP_GRANTED(buffer, time, microstep) do {
  buffer[0] = MSG_TYPE_STOP_GRANTED;
  encode_int64(time, &(buffer[1]));
  assert(microstep >= 0);
  encode_int32((int32_t)microstep, &(buffer[1 + sizeof(instant_t)]));
  } while(0)
  ```

### **Byte which is identifying a message**

#### `MSG_TYPE_ADDRESS_QUERY`

- Byte identifying a address query message, sent by a federate to RTI to ask for another federate's address and port number.
  - The next two bytes are the other federate's ID.
- The reply from the RTI will a port number (an int32_t), which is -1 if the RTI does not know yet (it has not received `MSG_TYPE_ADDRESS_ADVERTISEMENT` from the other federate), followed by the IP address of the other federate (an IPV4 address, which has length INET_ADDRSTRLEN).

  ```c
  #define MSG_TYPE_ADDRESS_QUERY 13
  ```

#### `MSG_TYPE_ADDRESS_ADVERTISEMENT`

- Byte identifying a message advertising the port for the TCP connection server of a federate. This is utilized in decentralized coordination as well as for physical connections in centralized coordination.
  - The next four bytes (or sizeof(int32_t)) will be the port number.
- The sending federate will not wait for a response from the RTI and assumes its request will be processed eventually by the RTI.

  ```c
  #define MSG_TYPE_ADDRESS_ADVERTISEMENT 14
  ```

#### `MSG_TYPE_P2P_SENDING_FED_ID`

- Byte identifying a first message that is sent by a federate directly to another federate after establishing a socket connection to send messages directly to the federate. This first message contains two bytes identifying the sending federate (its ID), a byte giving the length of the federation ID, followed by the federation ID (a string).
- The response from the remote federate is expected to be MSG_TYPE_ACK, but if the remote federate does not expect this federate or federation to connect, it will respond instead with `MSG_TYPE_REJECT`.

  ```c
  #define MSG_TYPE_P2P_SENDING_FED_ID 15
  ```

#### `MSG_TYPE_P2P_MESSAGE`

- Byte identifying a message to send directly to another federate.
  - The next two bytes will be the ID of the destination port.
  - The next two bytes are the destination federate ID. This is checked against the `_lf_my_fed_id` of the receiving federate to ensure the message was intended for
  - The four bytes after will be the length of the message.
  - The ramaining bytes are the message.
  ```c
  #define MSG_TYPE_P2P_MESSAGE 16
  ```

#### `MSG_TYPE_P2P_TAGGED_MESSAGE`

- Byte identifying a timestamped message to send directly to another federate.
- This is a variant of @see MSG_TYPE_TAGGED_MESSAGE that is used in P2P connections between ederates. Having a separate message type for P2P connections between federates will be useful in preventing crosstalk.
  - The next two bytes will be the ID of the destination port.
  - The next two bytes are the destination federate ID. This is checked against the `_lf_my_fed_id` of the receiving federate to ensure the message was intended for the correct federate.
  - The four bytes after will be the length of the message.
  - The next eight bytes will be the timestamp.
  - The next four bytes will be the microstep of the sender.
  - The ramaining bytes are the message.
  ```c
  #define MSG_TYPE_P2P_TAGGED_MESSAGE 17
  ```

#### `MSG_TYPE_CLOSE_REQUEST`

- Byte identifying a message that a downstream federate sends to its
  upstream counterpart to request that the socket connection be closed.
- This is the only message that should flow upstream on such socket connections.

  ```c
  #define MSG_TYPE_CLOSE_REQUEST 18
  ```

### **Physical clock synchronization messages according to PTP**

#### `MSG_TYPE_CLOCK_SYNC_T1`

- The next 8 bytes will be a timestamp sent according to PTP.

  ```c
  #define MSG_TYPE_CLOCK_SYNC_T1 19
  ```

#### `MSG_TYPE_CLOCK_SYNC_T3`

- Prompts the master to send a T4.
  - The next four bytes will be the sendin federate's id
  ```c
  #define MSG_TYPE_CLOCK_SYNC_T3 20
  ```

#### `MSG_TYPE_CLOCK_SYNC_T4`

- The next 8 bytes will be a timestamp sent according to PTP.

  ```c
  #define MSG_TYPE_CLOCK_SYNC_T4 21
  ```

#### `MSG_TYPE_CLOCK_SYNC_CODED_PROBE`

- Coded probe message.
- This messages is sent by the server (master) right after MSG_TYPE_CLOCK_SYNC_T4(t1) with a new physical clock snapshot t2.
- At the receiver, the previous MSG_TYPE_CLOCK_SYNC_T4 message and this message are assigned a receive timestamp r1 and r2. If |(r2 - r1) - (t2 - t1)| < GUARD_BAND, then the current clock sync cycle is considered pure and can be processed.
- @see Geng, Yilong, et al. [Exploiting a natural network effect for scalable, fine-grained clock synchronization.](https://www.usenix.org/system/files/conference/nsdi18/nsdi18-geng.pdf)

  ```c
  #define MSG_TYPE_CLOCK_SYNC_CODED_PROBE 22
  ```

#### `MSG_TYPE_PORT_ABSENT`

- A port absent message, informing the receiver that a given port
- will not have event for the current logical time.
  - The next 2 bytes is the port id.
  - The next 2 bytes will be the federate id of the destination federate.
- This is needed for the centralized coordination so that the RTI knows where to forward the message.

  - The next 8 bytes are the intended time of the absent message
  - The next 4 bytes are the intended microstep of the absent message

  ```c
  #define MSG_TYPE_PORT_ABSENT 23
  ```

#### `MSG_TYPE_NEIGHBOR_STRUCTURE` and `MSG_TYPE_NEIGHBOR_STRUCTURE_HEADER_SIZE`

- A message that informs the RTI about connections between this federate and other federates where messages are routed through the RTI. Currently, this only includes logical connections when the coordination is centralized. This information is needed for the RTI to perform the centralized coordination.
- @note Only information about the immediate neighbors is required. The RTI can transitively obtain the structure of the federation based on each federate's immediate neighbor information.
  - The next 4 bytes is the number of upstream federates.
  - The next 4 bytes is the number of downstream federates.
- Depending on the first four bytes, the next bytes are pairs of (fed ID (2bytes), delay (8 bytes)) for this federate's connection to upstream federates(by direct connection). The delay is the minimum "after" delay of all connections from the upstream federate.
- Depending on the second four bytes, the next bytes are fed IDs (2bytes each), of this federate's downstream federates (by direct connection).
- @note The upstream and downstream connections are transmitted on the same message to prevent (at least to some degree) the scenario where the RTI has information about one, but not the other (which is a critical error).

  ```c
  #define MSG_TYPE_NEIGHBOR_STRUCTURE 24
  #define MSG_TYPE_NEIGHBOR_STRUCTURE_HEADER_SIZE 9
  ```

### **Rejection codes**

These codes are sent in a `MSG_TYPE_REJECT` message and they are limited to one byte (uchar).

#### `FEDERATION_ID_DOES_NOT_MATCH`

- Federation ID does not match.

  ```c
  #define FEDERATION_ID_DOES_NOT_MATCH 1
  ```

#### `FEDERATE_ID_IN_USE`

- Federate with the specified ID has already joined.
  ```c
  #define FEDERATE_ID_IN_USE 2
  ```

#### `FEDERATE_ID_OUT_OF_RANGE`

- Federate ID out of range.

  ```c
  #define FEDERATE_ID_OUT_OF_RANGE 3
  ```

#### `UNEXPECTED_MESSAGE`

- Incoming message is not expected. \_/
  ```c
  #define UNEXPECTED_MESSAGE 4
  ```

#### `WRONG_SERVER`

- Connected to the wrong server.
  ```c
  #define WRONG_SERVER 5
  ```