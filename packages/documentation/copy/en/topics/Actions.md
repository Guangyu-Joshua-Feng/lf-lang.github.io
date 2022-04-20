---
title: "Actions"
layout: docs
permalink: /docs/handbook/actions
oneline: "Actions in Lingua Franca."
preamble: >
---

$page-showing-target$

## Action Declaration

An action declaration has one of the following forms:

```lf
    logical action <name>(<min_delay>, <min_spacing>, <policy>)
    physical action <name>(<min_delay>, <min_spacing>, <policy>)
```

The `min_delay`, `min_spacing`, and `policy` are all optional. If only one argument is given in parentheses, then it is interpreted as an `min_delay`, if two are given, then they are interpreted as `min_delay` and `min_spacing`. The `min_delay` and `min_spacing` are time values. The `policy` argument is a string that can be one of the following: `"defer"` (the default), `"drop"`, or `"replace"`. Note that the quotation marks are needed.

<div class="lf-c lf-cpp lf-ts lf-rs">

If the action is to carry a payload, then a type must be given as well:

```lf
    logical action <name>(<min_delay>, <min_spacing>, <policy>):<type>
    physical action <name>(<min_delay>, <min_spacing>, <policy>):<type>
```

</div>

## Logical Actions

Timers are useful to trigger reactions once or periodically. Actions are used to trigger reactions more irregularly. An action, like an output or input port, can carry data, but unlike a port, an action is visible only within the reactor that defines it.

There are two kinds of actions, **logical** and **physical**. A $logical$ $action$ is used by a reactor to schedule a trigger at a fixed logical time interval _d_ into the future. The time interval _d_, which is called a **delay**, is relative to the logical time _t_ at which the scheduling occurs. If a reaction executes at logical time _t_ and schedules an action `a` with delay _d_, then any reaction that is triggered by `a` will be invoked at logical time _t_ + _d_. For example, the following reaction schedules something (printing the current elapsed logical time) 200 msec after an input `x` arrives:

$start(Schedule)$

```lf-c
target C;
reactor Schedule {
    input x:int;
    logical action a;
    reaction(x) -> a {=
        schedule(a, MSEC(200));
    =}
    reaction(a) {=
        interval_t elapsed_time = get_elapsed_logical_time();
        printf("Action triggered at logical time %lld nsec after start.\n", elapsed_time);
    =}
}
```

```lf-cpp
target Cpp;

reactor Schedule {
    input x:int;
    logical action a;
    reaction(x) -> a {=
        a.schedule(200ms);
    =}
    reaction(a) {=
        auto elapsed_time = get_elapsed_logical_time();
        std::cout << "Action triggered at logical time " << elapsed_time << "  nsec after start." << std::endl;
    =}
}

```

```lf-py
WARNING: No source file found: ../code/py/src/Schedule.lf
```

```lf-ts
WARNING: No source file found: ../code/ts/src/Schedule.lf
```

```lf-rs
WARNING: No source file found: ../code/rs/src/Schedule.lf
```

$end(Schedule)$

<img alt="Lingua Franca diagram" src="../../../../../img/diagrams/Schedule.svg" width="200"/>

Here, the delay is specified in the call to `schedule()` within the target language code. Notice that in the diagram, a logical action is shown as a triangle with an **L**. Logical actions are always scheduled within a reaction of the reactor that declares the action.

The arguments to the `schedule()` function are the action named `a` and a time. The action `a` has to be declared as an effect of the reaction in order to reference it in the call to `schedule()`. If you fail to declare it as an effect (after the `->` in the reaction signature), then you will get an error message.

<div class="lf-c">

The time argument to the `schedule()` function has data type `interval_t`, which, with the exception of some embedded platforms, is a C `long long`. A collection of convenience macros is provided like the `MSEC` macro above to specify time values in a more readable way. The provided macros are `NSEC`, `USEC` (for microseconds), `MSEC`, `SEC`, `MINUTE`, `HOUR`, `DAY`, and `WEEK`. You may also use the plural of any of these, e.g. `WEEKS(2)`.

The time argument to the `schedule()` function is required to be non-negative. If it is zero, then the action will be scheduled one **microstep** later. See [Superdense Time](#superdense-time) below.

An action may have a data type, in which case, a variant of the `schedule()` function can be used to specify a **payload**, a data value that is carried from where the `schedule()` function is called to the reaction that is triggered by the action. See [Actions With Values](/docs/handbook/c-reactors#actions-with-values) in the C Reactors documentation.

</div>

<div class="lf-cpp">

<span class="warning">FIXME</span>

The time argument to the `schedule()` function is required to be non-negative. If it is zero, then the action will be scheduled one **microstep** later. See [Superdense Time](#superdense-time) below.

An action may have a data type, in which case, a variant of the `schedule()` function can be used to specify a **payload**, a data value that is carried from where the `schedule()` function is called to the reaction that is triggered by the action. See [Actions With Values](/docs/handbook/cpp-reactors#actions-with-values) in the C++ Reactors documentation.

</div>

<div class="lf-py">

<span class="warning">FIXME</span>

The time argument to the `schedule()` function is required to be non-negative. If it is zero, then the action will be scheduled one **microstep** later. See [Superdense Time](#superdense-time) below.

An action may have a data type, in which case, a variant of the `schedule()` function can be used to specify a **payload**, a data value that is carried from where the `schedule()` function is called to the reaction that is triggered by the action. See [Actions With Values](/docs/handbook/python-reactors#actions-with-values) in the Python Reactors documentation.

</div>

<div class="lf-ts">

<span class="warning">FIXME</span>

The time argument to the `schedule()` function is required to be non-negative. If it is zero, then the action will be scheduled one **microstep** later. See [Superdense Time](#superdense-time) below.

An action may have a data type, in which case, a variant of the `schedule()` function can be used to specify a **payload**, a data value that is carried from where the `schedule()` function is called to the reaction that is triggered by the action. See [Actions With Values](/docs/handbook/typescript-reactors#actions-with-values) in the TypeScript Reactors documentation.

</div>

<div class="lf-rs">

<span class="warning">FIXME</span>

The time argument to the `schedule()` function is required to be non-negative. If it is zero, then the action will be scheduled one **microstep** later. See [Superdense Time](#superdense-time) below.

An action may have a data type, in which case, a variant of the `schedule()` function can be used to specify a **payload**, a data value that is carried from where the `schedule()` function is called to the reaction that is triggered by the action. See [Actions With Values](/docs/handbook/rust-reactors#actions-with-values) in the Rust Reactors documentation.

</div>

## Physical Actions

A $physical$ $action$ is used to schedule reactions at logical times determined by the local physical clock. If a physical action with delay _d_ is scheduled at _physical_ time _T_, then the _logical time_ assigned to the event is _T_ + _d_. For example, the following reactor schedules the physical action `p` to trigger at a **logical time** equal to the **physical time** at which the input `x` arrives:

$start(Physical)$

```lf-c
target C;
reactor Physical {
    input x:int;
    physical action a;
    reaction(x) -> a {=
        schedule(a, 0);
    =}
    reaction(a) {=
        interval_t elapsed_time = get_elapsed_logical_time();
        printf("Action triggered at logical time %lld nsec after start.\n", elapsed_time);
    =}
}
```

```lf-cpp
target Cpp;

reactor Physical {
    input x:int;
    physical action a;

    reaction(x) -> a {=
        a.schedule(0ms);
    =}

    reaction(a) {=
        auto elapsed_time = get_elapsed_logical_time();
        std::cout << "Action triggered at logical time " << elapsed_time << " nsec after start." << std::endl;
    =}
}

```

```lf-py
WARNING: No source file found: ../code/py/src/Physical.lf
```

```lf-ts
WARNING: No source file found: ../code/ts/src/Physical.lf
```

```lf-rs
WARNING: No source file found: ../code/rs/src/Physical.lf
```

$end(Physical)$

<img alt="Lingua Franca diagram" src="../../../../../img/diagrams/Physical.svg" width="200"/>

If you drive this with a timer, using for example the following structure:

<img alt="Lingua Franca diagram" src="../../../../../img/diagrams/PhysicalTest.svg" width="400"/>

then running the program will yield an output something like this:

```
Action triggered at logical time 201491000 nsec after start.
Action triggered at logical time 403685000 nsec after start.
Action triggered at logical time 603669000 nsec after start.
...
```

Here, logical time is lagging physical time by a few milliseconds. Note that, unless the [fast option](/docs/handbook/target-specification#fast) is given, logical time _t_ chases physical time _T_, so _t_ < _T_. Hence, the event being scheduled in the reaction to input `x` is assured of being in the future in logical time.

Whereas logical actions are required to be scheduled within a reaction of the reactor that declares the action, physical actions can be scheduled by code that is outside the Lingua Franca system. For example, some other thread or a callback function may call `schedule()`, passing it a physical action. For example:

$start(Asynchronous)$

```lf-c
target C;
main reactor {
	preamble {=				
		// Schedule an event roughly every 200 msec.
		void* external(void* a) {
            while (true) {
    			lf_nanosleep(MSEC(200));
    			schedule(a, 0);
			}
		}
	=}
	state thread_id:lf_thread_t(0);	
    physical action a(100 msec):int;
  
	reaction(startup) -> a {=
		// Start a thread to schedule physical actions.
		lf_thread_create(&self->thread_id, &external, a);
	=}
	
	reaction(a) {=
        interval_t elapsed_time = get_elapsed_logical_time();
        printf("Action triggered at logical time %lld nsec after start.\n", elapsed_time);
	=}
}
```

```lf-cpp
target Cpp;
main reactor {
	private preamble {=
        #include <thread>
	=}

	state thread: std::thread;	
    physical action a:int;
  
	reaction(startup) -> a {=
		// Start a thread to schedule physical actions.
        thread = std::thread([&]{
            while (true) {
                std::this_thread::sleep_for(200ms);
                // the value that we give it really doesn't matter
                // but we the action should is scheduled for 100ms into the future
    			a.schedule(0, 100ms); 	
            }
        });
	=}
	
	reaction(a) {=
        auto elapsed_time = get_physical_time();
        std::cout << "Action triggered at logical time" << elapsed_time <<"nsec after start." << std::endl;
	=}
}

```

```lf-py
WARNING: No source file found: ../code/py/src/Asynchronous.lf
```

```lf-ts
WARNING: No source file found: ../code/ts/src/Asynchronous.lf
```

```lf-rs
WARNING: No source file found: ../code/rs/src/Asynchronous.lf
```

$end(Asynchronous)$

<img alt="Lingua Franca diagram" src="../../../../../img/diagrams/Asynchronous.svg" width="350"/>

Physical actions are the mechanism for obtaining input from the outside world. Because they are assigned a logical time derived from the physical clock, their logical time can be interpreted as a measure of the time at which some external event occurred.

<div class="lf-c">

In the above example, at $startup$, the main reactor creates an external thread that schedules a physical action roughly every 200 msec. The thread uses a built-in function `lf_nanosleep()`, which abstracts platform-specific mechanisms for stalling the thread for a specified amount of time. The thread is created with a built-in function `lf_thread_create()`, which similarly abstracts platform-specific mechanisms for creating threads.

The code executed by the thread is defined in a $preamble$ section. See [Preambles and Methods](/docs/handbook/preambles-and-methods).

**Important Note:** Asynchronous calls to `schedule()` will not work if you set the [`threading` target parameter](/docs/handbook/target-specification#threading) to `false`. You must use a threaded runtime for such asynchronous calls to work correctly.

<div>

## Triggering Time for Actions

An action will trigger at a logical time that depends on the arguments given to the schedule function, the `<min_delay>`, `<min_spacing>`, and `<policy>` arguments in the action declaration, and whether the action is physical or logical.

For a $logical$ action `a`, the tag assigned to the event resulting from a call to `schedule(a, <offset>)` is computed as follows. First, let _t_ be the _current logical time_. For a logical action, _t_ is just the logical time at which the reaction calling `schedule()` is called. The **preliminary time** of the action is then just _t_ + `<min_delay>` + `<offset>`. This preliminary time may be further modified, as explained below.

For a **physical** action, the preliminary time is similar, except that _t_ is replaced by the current _physical_ time _T_ when `schedule()` is called.

If a `<min_spacing>` has been declared, then it gives a minimum logical time interval between the tags of two subsequently scheduled events. If the preliminary time is closer than `<min_spacing>` to the time of the previously scheduled event (if there is one), then `<policy>` determines how the minimum spacing constraint is enforced. The `<policy>` is one of the following:

- `"defer"`: (**the default**) The event is added to the event queue with a tag that is equal to earliest time that satisfies the minimal spacing requirement. Assuming the time of the preceding event is _t_prev_, then the tag of the new event simply becomes _t_prev_ + `<min_spacing>`.
- `"drop"`: The new event is dropped and `schedule()` returns without having modified the event queue.
- `"replace"`: The payload (if any) of the new event is assigned to the preceding event if it is still pending in the event queue; no new event is added to the event queue in this case. If the preceding event has already been pulled from the event queue, the default `"defer"` policy is applied.

Note that while the `"defer"` policy is conservative in the sense that it does not discard events, it could potentially cause an unbounded growth of the event queue.