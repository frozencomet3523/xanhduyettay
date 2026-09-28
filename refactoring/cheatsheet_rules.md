# Refactoring (2nd Ed., Fowler) — Rules, Smells & Catalog Cheat Sheet

Quick reference for AI agents & developers. Page numbers in parentheses are the book's **printed** page numbers (as used in the catalog cross-references). Examples in the book are JavaScript.

---

## 1. Core Definitions & Philosophy (Ch. 1–2)

- **Refactoring (noun):** a change made to the internal structure of software to make it easier to understand and cheaper to modify *without changing its observable behavior*.
- **Refactoring (verb):** to restructure software by applying a series of refactorings without changing its observable behavior.
- **It's not just any cleanup** — refactoring is specifically small, **behavior-preserving** steps. If the code doesn't work the same before and after, it isn't refactoring.
- **The Two Hats (Kent Beck):** at any moment you're either *adding functionality* (new tests, new code) **or** *refactoring* (no new tests, no behavior change) — never both at once. Swap hats consciously and often.
- **Small steps:** each step leaves the code working, compiling, and passing tests. You go *faster* by taking tiny steps and composing them into large changes; the code is never broken.
- **The true test of good code is how easy it is to change it.** A healthy codebase maximizes the team's productivity.
- **Read → insight → refactor:** when you understand a piece of code, move that understanding *out of your head and into the code* so the next reader doesn't have to rediscover it.

## 2. Why Refactor?

- **To improve the design** — without refactoring, architecture decays as people make short-term changes.
- **To make software easier to understand** — code communicates to future readers (often yourself).
- **To help find bugs** — clarifying code surfaces the bugs hiding in it.
- **To program faster** — good internal quality sustains a fast pace of adding features (the "Design Stamina Hypothesis").

## 3. When to Refactor?

- **The Rule of Three:** the first time you do something you just do it; the second time you wince at the duplication but do it anyway; the **third** time, you refactor.
- **Preparatory refactoring** — make the change easy (warning: this may be hard), then make the easy change. Refactor just before adding a feature.
- **Comprehension refactoring** — refactor to understand code you're reading.
- **Litter-pickup refactoring** — leave the code cleaner than you found it (Boy Scout Rule), a bit at a time.
- **Planned vs. opportunistic** — prefer continuous, opportunistic refactoring woven into daily work over big scheduled "refactoring phases."
- **When NOT to:** when the code is ugly but you don't need to touch it (leave it), or when it's easier to rewrite from scratch than to refactor.

## 4. Making Refactoring Safe

- **Self-testing code (Ch. 4)** is the foundation. A comprehensive, fast, automated test suite lets you refactor fearlessly — when a test goes red you know the last small change is the culprit.
- **Write tests before you refactor**; run them frequently (after every small step).
- **Use automated refactorings** (IDE tools) where available — they're faster and safer than hand edits.
- **Refactoring, Architecture & YAGNI:** refactoring enables *evolutionary* architecture — you don't need to guess future flexibility up front (YAGNI); you can add it when needed.
- **Refactoring & Performance:** write clear code first, then optimize the measured hot spots. Well-factored code is *easier* to tune because you can isolate and profile it.

---

## 5. The Code Smell Catalog (Ch. 3) — with typical cures

| # | Smell | What it looks like | Common cures |
|---|---|---|---|
| 1 | **Mysterious Name** | Names that don't reveal intent | Change Function Declaration, Rename Variable, Rename Field |
| 2 | **Duplicated Code** | Same structure in multiple places | Extract Function, Slide Statements, Pull Up Method |
| 3 | **Long Function** | Functions that go on and on | Extract Function, Replace Temp with Query, Introduce Parameter Object, Decompose Conditional, Replace Conditional with Polymorphism |
| 4 | **Long Parameter List** | Too many parameters | Replace Parameter with Query, Preserve Whole Object, Introduce Parameter Object, Remove Flag Argument, Combine Functions into Class |
| 5 | **Global Data** | Mutable data reachable from anywhere | Encapsulate Variable |
| 6 | **Mutable Data** | Uncontrolled updates cause bugs | Encapsulate Variable, Split Variable, Slide Statements, Extract Function, Separate Query from Modifier, Remove Setting Method, Replace Derived Variable with Query, Change Reference to Value |
| 7 | **Divergent Change** | One module changed for many reasons | Split Phase, Move Function, Extract Function, Extract Class |
| 8 | **Shotgun Surgery** | One change touches many modules | Move Function/Field, Combine Functions into Class/Transform, Inline Function/Class |
| 9 | **Feature Envy** | A function more interested in another module | Move Function, Extract Function |
| 10 | **Data Clumps** | Same group of data items travel together | Extract Class, Introduce Parameter Object, Preserve Whole Object |
| 11 | **Primitive Obsession** | Primitives instead of small objects | Replace Primitive with Object, Replace Type Code with Subclasses, Extract Class |
| 12 | **Repeated Switches** | Same switch/conditional in many places | Replace Conditional with Polymorphism |
| 13 | **Loops** | Old-style loops | Replace Loop with Pipeline |
| 14 | **Lazy Element** | A class/function that doesn't earn its keep | Inline Function, Inline Class, Collapse Hierarchy |
| 15 | **Speculative Generality** | "We might need it one day" hooks | Collapse Hierarchy, Inline Function/Class, Change Function Declaration, Remove Dead Code |
| 16 | **Temporary Field** | Fields only set in some circumstances | Extract Class, Move Function, Introduce Special Case |
| 17 | **Message Chains** | `a.b().c().d()` navigation | Hide Delegate, Extract Function + Move Function |
| 18 | **Middle Man** | A class that only delegates | Remove Middle Man, Inline Function; or Replace Superclass/Subclass with Delegate |
| 19 | **Insider Trading** | Modules that know too much of each other | Move Function/Field, Hide Delegate, Replace Subclass/Superclass with Delegate |
| 20 | **Large Class** | A class doing too much | Extract Class/Superclass, Replace Type Code with Subclasses |
| 21 | **Alternative Classes w/ Different Interfaces** | Similar classes, mismatched APIs | Change Function Declaration, Move Function, Extract Superclass |
| 22 | **Data Class** | Fields + getters/setters, no behavior | Encapsulate Record, Move Function, Extract/Inline Function, Split Phase |
| 23 | **Refused Bequest** | Subclass ignores inherited stuff | Push Down Method/Field, Replace Subclass/Superclass with Delegate |
| 24 | **Comments** | Comments used as deodorant for bad code | Extract Function, Change Function Declaration, Introduce Assertion |

---

## 6. The Refactoring Catalog (Ch. 6–12)

### First Set — Building Blocks (Ch. 6)
- **Extract Function (106)** — turn a fragment into its own named function *(inverse: Inline Function)*.
- **Inline Function (115)** — replace a call with the function's body when the body is as clear as the name.
- **Extract Variable (119)** — name a subexpression with a local variable *(inverse: Inline Variable)*.
- **Inline Variable (123)** — replace a variable that adds nothing with its expression.
- **Change Function Declaration (124)** — rename a function or add/remove/reorder its parameters *(aka Rename Function / Change Signature)*.
- **Encapsulate Variable (132)** — route access to data through functions so you can control/monitor it.
- **Rename Variable (137)** — give a variable a clearer name (via Encapsulate Variable when widely used).
- **Introduce Parameter Object (140)** — replace a recurring group of arguments with a single object.
- **Combine Functions into Class (144)** — group functions that operate on common data into a class.
- **Combine Functions into Transform (149)** — derive values in one place via a transform function (good for read-only source data).
- **Split Phase (154)** — separate code that does two different things into sequential phases.

### Encapsulation (Ch. 7)
- **Encapsulate Record (162)** — replace a raw record with a class controlling access *(aka Replace Record with Data Class)*.
- **Encapsulate Collection (170)** — never expose a collection directly; return a copy / provide add/remove.
- **Replace Primitive with Object (174)** — turn a bare primitive into a small value class as it grows behavior.
- **Replace Temp with Query (178)** — replace a temp holding a computed value with a function.
- **Extract Class (182)** — split a class doing the work of two *(inverse: Inline Class)*.
- **Inline Class (186)** — fold a class that no longer earns its keep back into another.
- **Hide Delegate (189)** — hide a delegate object behind server methods (cure Message Chains).
- **Remove Middle Man (192)** — talk to the delegate directly when there's too much simple forwarding.
- **Substitute Algorithm (195)** — replace an algorithm's body with a clearer one.

### Moving Features (Ch. 8)
- **Move Function (198)** — move a function to the module/class it belongs with.
- **Move Field (207)** — move a field to a more appropriate record/class.
- **Move Statements into Function (213)** — pull repeated statements into a called function *(inverse: Move Statements to Callers)*.
- **Move Statements to Callers (217)** — push varying statements back out to callers.
- **Replace Inline Code with Function Call (222)** — replace hand-written code with a call to an existing function.
- **Slide Statements (223)** — move related statements together *(aka Consolidate Duplicate Conditional Fragments)*.
- **Split Loop (227)** — one loop should do one thing; split loops with multiple responsibilities.
- **Replace Loop with Pipeline (231)** — express iteration as a collection pipeline (map/filter/reduce).
- **Remove Dead Code (237)** — delete code that isn't used. ("digital flamethrower")

### Organizing Data (Ch. 9)
- **Split Variable (240)** — one variable, one responsibility (don't reuse a variable for two things).
- **Rename Field (244)** — rename a record/class field.
- **Replace Derived Variable with Query (248)** — recompute derived values instead of storing mutable copies.
- **Change Reference to Value (252)** — treat a small object as an immutable value *(inverse: Change Value to Reference)*.
- **Change Value to Reference (256)** — share a single object when many copies should be one entity.

### Simplifying Conditional Logic (Ch. 10)
- **Decompose Conditional (260)** — extract condition, then-leg, and else-leg into named functions.
- **Consolidate Conditional Expression (263)** — combine conditionals with the same result into one.
- **Replace Nested Conditional with Guard Clauses (266)** — use early returns for special cases instead of deep nesting.
- **Replace Conditional with Polymorphism (272)** — move variant behavior into subclasses/objects (cure Repeated Switches).
- **Introduce Special Case (289)** — handle a repeated special value with a dedicated object *(aka Introduce Null Object)*.
- **Introduce Assertion (302)** — make an assumed condition explicit and checked.

### Refactoring APIs (Ch. 11)
- **Separate Query from Modifier (306)** — a function should either return a value **or** have side effects, not both (Command–Query Separation).
- **Parameterize Function (310)** — merge functions that differ only by a literal value into one parameterized function.
- **Remove Flag Argument (314)** — replace a boolean/flag parameter with explicit separate functions.
- **Preserve Whole Object (319)** — pass the whole object rather than pulling several values out of it.
- **Replace Parameter with Query (324)** — let the function derive a value itself *(inverse: Replace Query with Parameter)*.
- **Replace Query with Parameter (327)** — pass a value in to remove an internal dependency.
- **Remove Setting Method (331)** — drop setters for fields that should be set-once/immutable.
- **Replace Constructor with Factory Function (334)** — use a factory when you need more than a plain constructor.
- **Replace Function with Command (337)** — turn a complex function into a command object *(inverse: Replace Command with Function)*.
- **Replace Command with Function (344)** — collapse a command object back into a function when it's simple.

### Dealing with Inheritance (Ch. 12)
- **Pull Up Method (350)** — move an identical method up to the superclass.
- **Pull Up Field (353)** — move a common field up to the superclass.
- **Pull Up Constructor Body (355)** — move shared constructor code up.
- **Push Down Method (359)** — move a method only used by one subclass down *(mirror: Push Down Field)*.
- **Push Down Field (361)** — move a field only used by one subclass down.
- **Replace Type Code with Subclasses (362)** — swap a type code for subclasses/polymorphism *(aka Replace Type Code with State/Strategy)*.
- **Remove Subclass (369)** — replace a subclass that adds too little with a field on the superclass.
- **Extract Superclass (375)** — pull common features of two classes into a new superclass.
- **Collapse Hierarchy (380)** — merge a class and its (nearly identical) super/subclass.
- **Replace Subclass with Delegate (381)** — favor delegation over inheritance for varying behavior.
- **Replace Superclass with Delegate (399)** — delegate to the former superclass instead of inheriting *(aka Replace Inheritance with Delegation)*.

---

## 7. Quick Decision Guide — "This code smells, now what?"

1. **Function too long / does many things?** → Extract Function; Split Phase; Replace Temp with Query.
2. **Too many parameters?** → Introduce Parameter Object; Preserve Whole Object; Replace Parameter with Query.
3. **A `switch`/`if` on a type code appears repeatedly?** → Replace Conditional with Polymorphism; Replace Type Code with Subclasses.
4. **Deeply nested conditionals?** → Replace Nested Conditional with Guard Clauses; Decompose Conditional.
5. **Data and the functions using it live apart?** → Move Function/Field; Combine Functions into Class.
6. **Raw primitive growing behavior/validation?** → Replace Primitive with Object.
7. **Mutable/global data causing bugs?** → Encapsulate Variable; Replace Derived Variable with Query; Split Variable.
8. **`a.b().c().d()` message chains?** → Hide Delegate.
9. **Inheritance being misused?** → Replace Subclass/Superclass with Delegate; Push Down / Pull Up members.
10. **A function both returns a value and mutates state?** → Separate Query from Modifier.
11. **Comment explaining a confusing block?** → Extract Function with an intention-revealing name.

> **Golden rhythm:** small step → run tests → commit. If a test fails, undo the last tiny step and try smaller. Refactor to *understand*, then to *improve*; keep behavior identical throughout.
