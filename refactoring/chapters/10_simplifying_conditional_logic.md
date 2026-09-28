# Chapter 10: Simplifying Conditional Logic

> **Pages:** 289 – 341
> **Summary:** Decompose Conditional, Consolidate Conditional Expression, Replace Nested Conditional with Guard Clauses, Replace Conditional with Polymorphism, Introduce Special Case (Introduce Null Object), Introduce Assertion.

---

## Chapter 10 Simplifying Conditional Logic

Much of the power of programs comes from their ability to implement conditional logic —but, sadly, much of the complexity of programs lies in these conditionals. I often use refactoring to make conditional sections easier to understand. I regularly apply *Decompose Conditional (260)* to complicated conditionals, and I use *Consolidate* *Conditional Expression (263)* to make logical combinations clearer. I use *Replace Nested Conditional with Guard Clauses (266)* to clarify cases where I want to run some prechecks before my main processing. If I see several conditions using the same switching logic, it’s a good time to pull *Replace Conditional with Polymorphism (272)* out the box. A lot of conditionals are used to handle special cases, such as nulls; if that logic is mostly the same, then *Introduce Special Case (289)* (often referred to as *Introduce Null* *Object (289)*) can remove a lot of duplicate code. And, although I like to remove conditions a lot, if I want to communicate (and check) a program’s state, I find *Introduce Assertion (302)* a worthwhile addition.

### DECOMPOSE CONDITIONAL

<!-- Page 290 -->

#### Motivation

One of the most common sources of complexity in a program is complex conditional logic. As I write code to do various things depending on various conditions, I can quickly end up with a pretty long function. Length of a function is in itself a factor that makes it harder to read, but conditions increase the difficulty. The problem usually lies in the fact that the code, both in the condition checks and in the actions, tells me what happens but can easily obscure *why* it happens.

As with any large block of code, I can make my intention clearer by decomposing it and replacing each chunk of code with a function call named after the intention of that chunk. With conditions, I particularly like doing this for the conditional part and each of the alternatives. This way, I highlight the condition and make it clear what I’m branching on. I also highlight the reason for the branching.

This is really just a particular case of applying *Extract Function (106)* to my code, but I like to highlight this case as one where I’ve often found a remarkably good value for the exercise.

#### Mechanics

Apply *Extract Function (106)* on the condition and each leg of the conditional.

#### Example

<!-- Page 291 -->

Suppose I’m calculating the charge for something that has separate rates for winter and summer:
```
if (!aDate.isBefore(plan.summerStart) &&!aDate.isAfter(plan.summerEnd))
charge = quantity * plan.summerRate;
else
charge = quantity * plan.regularRate + plan.regularServiceCharge;
```
I extract the condition into its own function.
```
if (summer())
charge = quantity * plan.summerRate;
else
charge = quantity * plan.regularRate + plan.regularServiceCharge;
function summer() {
return!aDate.isBefore(plan.summerStart) &&!aDate.isAfter(plan.summerEnd);
}
```
##### Then I do the then leg:
```
if (summer())
charge = summerCharge();
else
charge = quantity * plan.regularRate + plan.regularServiceCharge;
function summer() {
return!aDate.isBefore(plan.summerStart) &&!aDate.isAfter(plan.summerEnd);
}
function summerCharge() {
return quantity * plan.summerRate;
}
```
##### Finally, the else leg:

<!-- Page 292 -->

```
if (summer())
charge = summerCharge();
else
charge = regularCharge();
function summer() {
return !aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd);
}
function summerCharge() {
return quantity * plan.summerRate;
}
function regularCharge() {
return quantity * plan.regularRate + plan.regularServiceCharge;
}
```

With that done, I like to reformat the conditional using the ternary operator.
```
charge = summer() ? summerCharge() : regularCharge();
function summer() {
return !aDate.isBefore(plan.summerStart) && !aDate.isAfter(plan.summerEnd);
}
function summerCharge() {
return quantity * plan.summerRate;
}
function regularCharge() {
return quantity * plan.regularRate + plan.regularServiceCharge;
}
```

### CONSOLIDATE CONDITIONAL EXPRESSION

<!-- Page 293 -->

#### Motivation

Sometimes, I run into a series of conditional checks where each check is different yet the resulting action is the same. When I see this, I use and and or operators to consolidate them into a single conditional check with a single result.

Consolidating the conditional code is important for two reasons. First, it makes it clearer by showing that I’m really making a single check that combines other checks. The sequence has the same effect, but it looks like I’m carrying out a sequence of separate checks that just happen to be close together. The second reason I like to do this is that it often sets me up for *Extract Function (106)*. Extracting a condition is one of the most useful things I can do to clarify my code. It replaces a statement of what I’m doing with why I’m doing it.

The reasons in favor of consolidating conditionals also point to the reasons against doing it. If I consider it to be truly independent checks that shouldn’t be thought of as a single check, I don’t do the refactoring.

#### Mechanics

Ensure that none of the conditionals have any side effects.

If any do, use *Separate Query from Modifier (306)* on them first.

<!-- Page 294 -->

Take two of the conditional statements and combine their conditions using a logical operator.

Sequences combine with or, nested if statements combine with and.

Test.

Repeat combining conditionals until they are all in a single condition.

Consider using *Extract Function (106)* on the resulting condition.

#### Example

Perusing some code, I see the following:
```
function disabilityAmount(anEmployee) {
if (anEmployee.seniority < 2) return 0;
if (anEmployee.monthsDisabled > 12) return 0;
if (anEmployee.isPartTime) return 0;
// compute the disability amount
```

It’s a sequence of conditional checks which all have the same result. Since the result is the same, I should combine these conditions into a single expression. For a sequence like this, I do it using an or operator.
```
function disabilityAmount(anEmployee) {
if ((anEmployee.seniority < 2)
|| (anEmployee.monthsDisabled > 12)) return 0;
if (anEmployee.isPartTime) return 0;
// compute the disability amount
```

I test, then fold in the other condition:
```
function disabilityAmount(anEmployee) {
if ((anEmployee.seniority < 2)
|| (anEmployee.monthsDisabled > 12)
|| (anEmployee.isPartTime)) return 0;
// compute the disability amount
```

<!-- Page 295 -->

Once I have them all together, I use *Extract Function (106)* on the condition.
```
function disabilityAmount(anEmployee) {
if (isNotEligableForDisability()) return 0;
// compute the disability amount
function isNotEligableForDisability() {
return ((anEmployee.seniority < 2)
|| (anEmployee.monthsDisabled > 12)
|| (anEmployee.isPartTime));
}
```

#### Example: Using ands

The example above showed combining statements with an or, but I may run into cases that need ands as well. Such a case uses nested if statements:
```
if (anEmployee.onVacation)
if (anEmployee.seniority > 10)
return 1;
return 0.5;
```

I combine these using and operators.
```
if ((anEmployee.onVacation)
&& (anEmployee.seniority > 10)) return 1;
return 0.5;
```

If I have a mix of these, I can combine using and and or operators as needed. When this happens, things are likely to get messy, so I use *Extract Function (106)* liberally to make it all understandable.

### REPLACE NESTED CONDITIONAL WITH GUARD CLAUSES

<!-- Page 296 -->

#### Motivation

I often find that conditional expressions come in two styles. In the first style, both legs of the conditional are part of normal behavior, while in the second style, one leg is normal and the other indicates an unusual condition.

These kinds of conditionals have different intentions—and these intentions should come through in the code. If both are part of normal behavior, I use a condition with an if and an else leg. If the condition is an unusual condition, I check the condition and return if it’s true. This kind of check is often called a guard clause.

The key point of Replace Nested Conditional with Guard Clauses is emphasis. If I’m using an ifthenelse construct, I’m giving equal weight to the if leg and the else leg.

<!-- Page 297 -->

This communicates to the reader that the legs are equally likely and important. Instead, the guard clause says, “This isn’t the core to this function, and if it happens, do something and get out.”

I often find I use Replace Nested Conditional with Guard Clauses when I’m working with a programmer who has been taught to have only one entry point and one exit point from a method. One entry point is enforced by modern languages, but one exit point is really not a useful rule. Clarity is the key principle: If the method is clearer with one exit point, use one exit point; otherwise don’t.

#### Mechanics

Select outermost condition that needs to be replaced, and change it into a guard clause.

Test.

##### Repeat as needed.

If all the guard clauses return the same result, use *Consolidate Conditional* *Expression (263)*.

#### Example

Here’s some code to calculate a payment amount for an employee. It’s only relevant if the employee is still with the company, so it has to check for the two other cases.
```
function payAmount(employee) {
let result;
if(employee.isSeparated) {
result = {amount: 0, reasonCode: "SEP"};
}
else {
if (employee.isRetired) {
result = {amount: 0, reasonCode: "RET"};
}
else {
// logic to compute amount
lorem.ipsum(dolor.sitAmet);
consectetur(adipiscing).elit();
sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
ut.enim.ad(minim.veniam);
result = someFinalComputation();
}
```

<!-- Page 298 -->

```
}
return result;
}
```
Nesting the conditionals here masks the true meaning of what it going on. The primary purpose of this code only applies if these conditions aren’t the case. In this situation, the intention of the code reads more clearly with guard clauses.

As with any refactoring change, I like to take small steps, so I begin with the topmost condition.
```
function payAmount(employee) {
let result;
if (employee.isSeparated) return {amount: 0, reasonCode: "SEP"};
if (employee.isRetired) {
result = {amount: 0, reasonCode: "RET"};
}
else {
// logic to compute amount
lorem.ipsum(dolor.sitAmet);
consectetur(adipiscing).elit();
sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
ut.enim.ad(minim.veniam);
result = someFinalComputation();
}
return result;
}
```
I test that change and move on to the next one.
```
function payAmount(employee) {
let result;
if (employee.isSeparated) return {amount: 0, reasonCode: "SEP"};
if (employee.isRetired) return {amount: 0, reasonCode: "RET"};
// logic to compute amount
lorem.ipsum(dolor.sitAmet);
consectetur(adipiscing).elit();
sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
ut.enim.ad(minim.veniam);
result = someFinalComputation();
return result;
}
```

<!-- Page 299 -->

At which point the result variable isn’t really doing anything useful, so I remove it.
```
function payAmount(employee) {
let result;
if (employee.isSeparated) return {amount: 0, reasonCode: "SEP"};
if (employee.isRetired) return {amount: 0, reasonCode: "RET"};
// logic to compute amount
lorem.ipsum(dolor.sitAmet);
consectetur(adipiscing).elit();
sed.do.eiusmod = tempor.incididunt.ut(labore) && dolore(magna.aliqua);
ut.enim.ad(minim.veniam);
return someFinalComputation();
}
```
The rule is that you always get an extra strawberry when you remove a mutable variable.

#### Example: Reversing the Conditions

When reviewing the manuscript of the first edition of this book, Joshua Kerievsky pointed out that we often do Replace Nested Conditional with Guard Clauses by reversing the conditional expressions. Even better, he gave me an example so I didn’t have to further tax my imagination.
```
function adjustedCapital(anInstrument) {
let result = 0;
if (anInstrument.capital > 0) {
if (anInstrument.interestRate > 0 && anInstrument.duration > 0) {
result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
}
}
return result;
}
```
Again, I make the replacements one at a time, but this time I reverse the condition as I put in the guard clause.

<!-- Page 300 -->

```
function adjustedCapital(anInstrument) {
let result = 0;
if (anInstrument.capital <= 0) return result;
if (anInstrument.interestRate > 0 && anInstrument.duration > 0) {
result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
}
return result;
}
```
The next conditional is a bit more complicated, so I do it in two steps. First, I simply add a not.
```
function adjustedCapital(anInstrument) {
let result = 0;
if (anInstrument.capital <= 0) return result;
if (!(anInstrument.interestRate > 0 && anInstrument.duration > 0)) return result;
result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
return result;
}
```
Leaving nots in a conditional like that twists my mind around at a painful angle, so I simplify it:
```
function adjustedCapital(anInstrument) {
let result = 0;
if (anInstrument.capital <= 0) return result;
if (anInstrument.interestRate <= 0 || anInstrument.duration <= 0) return result;
result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
return result;
}
```
Both of those lines have conditions with the same result, so I apply *Consolidate* *Conditional Expression (263)*.

<!-- Page 301 -->

```
function adjustedCapital(anInstrument) {
let result = 0;
if ( anInstrument.capital <= 0
|| anInstrument.interestRate <= 0
|| anInstrument.duration <= 0) return result;
result = (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
return result;
}
```

The result variable is doing two things here. Its first setting to zero indicates what to return when the guard clause triggers; its second value is the final computation. I can get rid of it, which both eliminates its double usage and gets me a strawberry.
```
function adjustedCapital(anInstrument) {
if ( anInstrument.capital <= 0
|| anInstrument.interestRate <= 0
|| anInstrument.duration <= 0) return 0;
return (anInstrument.income / anInstrument.duration) * anInstrument.adjustmentFactor;
}
```

### REPLACE CONDITIONAL WITH POLYMORPHISM

<!-- Page 302 -->

#### Motivation

Complex conditional logic is one of the hardest things to reason about in programming, so I always look for ways to add structure to conditional logic. Often, I find I can separate the logic into different circumstances—highlevel cases—to divide the conditions. Sometimes it’s enough to represent this division within the structure of a conditional itself, but using classes and polymorphism can make the separation more explicit.

A common case for this is where I can form a set of types, each handling the conditional logic differently. I might notice that books, music, and food vary in how they are handled because of their type. This is made most obvious when there are several functions that have a switch statement on a type code. In that case, I remove the duplication of the common switch logic by creating classes for each case and using

<!-- Page 303 -->

polymorphism to bring out the typespecific behavior.

Another situation is where I can think of the logic as a base case with variants. The base case may be the most common or most straightforward. I can put this logic into a superclass which allows me to reason about it without having to worry about the variants. I then put each variant case into a subclass, which I express with code that emphasizes its difference from the base case.

Polymorphism is one of the key features of objectoriented programming—and, like any useful feature, it’s prone to overuse. I’ve come across people who argue that all examples of conditional logic should be replaced with polymorphism. I don’t agree with that view. Most of my conditional logic uses basic conditional statements—if/else and switch/case. But when I see complex conditional logic that can be improved as discussed above, I find polymorphism a powerful tool.

#### Mechanics

If classes do not exist for polymorphic behavior, create them together with a factory function to return the correct instance.

Use the factory function in calling code.

Move the conditional function to the superclass.

If the conditional logic is not a selfcontained function, use *Extract Function (106)* to make it so.

Pick one of the subclasses. Create a subclass method that overrides the conditional statement method. Copy the body of that leg of the conditional statement into the subclass method and adjust it to fit.

Repeat for each leg of the conditional.

Leave a default case for the superclass method. Or, if superclass should be abstract, declare that method as abstract or throw an error to show it should be the responsibility of a subclass.

#### Example

My friend has a collection of birds and wants to know how fast they can fly and what they have for plumage. So we have a couple of small programs to determine the information.

<!-- Page 304 -->

```
function plumages(birds) {
return new Map(birds.map(b => [b.name, plumage(b)]));
}
function speeds(birds) {
return new Map(birds.map(b => [b.name, airSpeedVelocity(b)]));
}
function plumage(bird) {
switch (bird.type) {
case 'EuropeanSwallow':
return "average";
case 'AfricanSwallow':
return (bird.numberOfCoconuts > 2) ? "tired" : "average";
case 'NorwegianBlueParrot':
return (bird.voltage > 100) ? "scorched" : "beautiful";
default:
return "unknown";
}
}
function airSpeedVelocity(bird) {
switch (bird.type) {
case 'EuropeanSwallow':
return 35;
case 'AfricanSwallow':
return 40  2 * bird.numberOfCoconuts;
case 'NorwegianBlueParrot':
return (bird.isNailed) ? 0 : 10 + bird.voltage / 10;
default:
return null;
}
}
```

We have a couple of different operations that vary with the type of bird, so it makes sense to create classes and use polymorphism for any typespecific behavior.

I begin by using *Combine Functions into Class (144)* on airSpeedVelocity and
```
plumage.
function plumage(bird) {
return new Bird(bird).plumage;
}
function airSpeedVelocity(bird) {
return new Bird(bird).airSpeedVelocity;
```

<!-- Page 305 -->

```
}
class Bird {
constructor(birdObject) {
Object.assign(this, birdObject);
}
get plumage() {
switch (this.type) {
case'EuropeanSwallow':
return "average";
case'AfricanSwallow':
return (this.numberOfCoconuts > 2)? "tired" : "average";
case'NorwegianBlueParrot':
return (this.voltage > 100)? "scorched" : "beautiful";
default:
return "unknown";
}
}
get airSpeedVelocity() {
switch (this.type) {
case'EuropeanSwallow':
return 35;
case'AfricanSwallow':
return 40 2 * this.numberOfCoconuts;
case'NorwegianBlueParrot':
return (this.isNailed)? 0 : 10 + this.voltage / 10;
default:
return null;
}
}
}
```
I now add subclasses for each kind of bird, together with a factory function to instantiate the appropriate subclass.
```
function plumage(bird) {
return createBird(bird).plumage;
}
function airSpeedVelocity(bird) {
return createBird(bird).airSpeedVelocity;
}
function createBird(bird) {
switch (bird.type) {
case'EuropeanSwallow':
return new EuropeanSwallow(bird);
case'AfricanSwallow':
return new AfricanSwallow(bird);
```

<!-- Page 306 -->

```
case'NorweigianBlueParrot':
return new NorwegianBlueParrot(bird);
default:
return new Bird(bird);
}
}
class EuropeanSwallow extends Bird {
}
class AfricanSwallow extends Bird {
}
class NorwegianBlueParrot extends Bird {
}
```
Now that I’ve created the class structure that I need, I can begin on the two conditional methods. I’ll begin with plumage. I take one leg of the switch statement and override it in the appropriate subclass.

*class EuropeanSwallow…*

```
get plumage() {
return "average";
}
```
*class Bird…*
```
get plumage() {
switch (this.type) {
case'EuropeanSwallow':
throw "oops";
case'AfricanSwallow':
return (this.numberOfCoconuts > 2)? "tired" : "average";
case'NorwegianBlueParrot':
return (this.voltage > 100)? "scorched" : "beautiful";
default:
return "unknown";
}
}
```
*I put in the* throw *because I’m paranoid.*

I can compile and test at this point. Then, if all is well, I do the next leg.

<!-- Page 307 -->

*class AfricanSwallow…*
```
get plumage() {
return (this.numberOfCoconuts > 2)? "tired" : "average";
}
```
##### Then, the Norwegian Blue:

*class NorwegianBlueParrot…*
```
get plumage() {
return (this.voltage > 100)? "scorched" : "beautiful";
}
```
I leave the superclass method for the default case.

*class Bird…*

```
get plumage() {
return "unknown";
}
```
I repeat the same process for airSpeedVelocity. Once I’m done, I end up with the following code (I also inlined the toplevel functions for airSpeedVelocity and plumage):
```
function plumages(birds) {
return new Map(birds
.map(b => createBird(b))
.map(bird => [bird.name, bird.plumage]));
}
function speeds(birds) {
return new Map(birds
.map(b => createBird(b))
.map(bird => [bird.name, bird.airSpeedVelocity]));
}
function createBird(bird) {
```

<!-- Page 308 -->

```
switch (bird.type) {
case'EuropeanSwallow':
return new EuropeanSwallow(bird);
case'AfricanSwallow':
return new AfricanSwallow(bird);
case'NorwegianBlueParrot':
return new NorwegianBlueParrot(bird);
default:
return new Bird(bird);
}
}
class Bird {
constructor(birdObject) {
Object.assign(this, birdObject);
}
get plumage() {
return "unknown";
}
get airSpeedVelocity() {
return null;
}
}
class EuropeanSwallow extends Bird {
get plumage() {
return "average";
}
get airSpeedVelocity() {
return 35;
}
}
class AfricanSwallow extends Bird {
get plumage() {
return (this.numberOfCoconuts > 2)? "tired" : "average";
}
get airSpeedVelocity() {
return 40 2 * this.numberOfCoconuts;
}
}
class NorwegianBlueParrot extends Bird {
get plumage() {
return (this.voltage > 100)? "scorched" : "beautiful";
}
get airSpeedVelocity() {
return (this.isNailed)? 0 : 10 + this.voltage / 10;
}
}
```
Looking at this final code, I can see that the superclass Bird isn’t strictly needed. In JavaScript, I don’t need a type hierarchy for polymorphism; as long as my objects implement the appropriately named methods, everything works fine. In this situation,

<!-- Page 309 -->

however, I like to keep the unnecessary superclass as it helps explain the way the classes are related in the domain.

#### Example: Using Polymorphism for Variation

With the birds example, I’m using a clear generalization hierarchy. That’s how subclassing and polymorphism is often discussed in textbooks (including mine)—but it’s not the only way inheritance is used in practice; indeed, it probably isn’t the most common or best way. Another case for inheritance is when I wish to indicate that one object is mostly similar to another, but with some variations.

As an example of this case, consider some code used by a rating agency to compute an investment rating for the voyages of sailing ships. The rating agency gives out either an “A” or “B” rating, depending of various factors due to risk and profit potential. The risk comes from assessing the nature of the voyage as well as the history of the captain’s prior voyages.
```
function rating(voyage, history) {
const vpf = voyageProfitFactor(voyage, history);
const vr = voyageRisk(voyage);
const chr = captainHistoryRisk(voyage, history);
if (vpf * 3 > (vr + chr * 2)) return "A";
else return "B";
}
function voyageRisk(voyage) {
let result = 1;
if (voyage.length > 4) result += 2;
if (voyage.length > 8) result += voyage.length 8;
if (["china", "eastindies"].includes(voyage.zone)) result += 4;
return Math.max(result, 0);
}
function captainHistoryRisk(voyage, history) {
let result = 1;
if (history.length < 5) result += 4;
result += history.filter(v => v.profit < 0).length;
if (voyage.zone === "china" && hasChina(history)) result = 2;
return Math.max(result, 0);
}
function hasChina(history) {
return history.some(v => "china" === v.zone);
}
function voyageProfitFactor(voyage, history) {
let result = 2;
if (voyage.zone === "china") result += 1;
if (voyage.zone === "eastindies") result += 1;
if (voyage.zone === "china" && hasChina(history)) {
```

<!-- Page 310 -->

```
result += 3;
if (history.length > 10) result += 1;
if (voyage.length > 12) result += 1;
if (voyage.length > 18) result = 1;
}
else {
if (history.length > 8) result += 1;
if (voyage.length > 14) result = 1;
}
return result;
}
```
The functions voyageRisk and captainHistoryRisk score points for risk, voyageProfitFactor scores points for the potential profit, and rating combines these to give the overall rating for the voyage.

The calling code would look something like this:
```
const voyage = {zone: "westindies", length: 10};
const history = [
{zone: "eastindies", profit: 5},
{zone: "westindies", profit: 15},
{zone: "china", profit: 2},
{zone: "westafrica", profit: 7},
];
const myRating = rating(voyage, history);
```
What I want to focus on here is how a couple of places use conditional logic to handle the case of a voyage to China where the captain has been to China before.
```
function rating(voyage, history) {
const vpf = voyageProfitFactor(voyage, history);
const vr = voyageRisk(voyage);
const chr = captainHistoryRisk(voyage, history);
if (vpf * 3 > (vr + chr * 2)) return "A";
else return "B";
}
function voyageRisk(voyage) {
let result = 1;
if (voyage.length > 4) result += 2;
if (voyage.length > 8) result += voyage.length 8;
if (["china", "eastindies"].includes(voyage.zone)) result += 4;
```

<!-- Page 311 -->

```
return Math.max(result, 0);
}
function captainHistoryRisk(voyage, history) {
let result = 1;
if (history.length < 5) result += 4;
result += history.filter(v => v.profit < 0).length;
if (voyage.zone === "china" && hasChina(history)) result = 2;
return Math.max(result, 0);
}
function hasChina(history) {
return history.some(v => "china" === v.zone);
}
function voyageProfitFactor(voyage, history) {
let result = 2;
if (voyage.zone === "china") result += 1;
if (voyage.zone === "eastindies") result += 1;
if (voyage.zone === "china" && hasChina(history)) {
result += 3;
if (history.length > 10) result += 1;
if (voyage.length > 12) result += 1;
if (voyage.length > 18) result = 1;
}
else {
if (history.length > 8) result += 1;
if (voyage.length > 14) result = 1;
}
return result;
}
```
I will use inheritance and polymorphism to separate out the logic for handling these cases from the base logic. This is a particularly useful refactoring if I’m about to introduce more special logic for this case—and the logic for these repeat China voyages can make it harder to understand the base case.

I’m beginning with a set of functions. To introduce polymorphism, I need to create a class structure, so I begin by applying *Combine Functions* i*nto Class (144)*. This results in the following code:
```
function rating(voyage, history) {
return new Rating(voyage, history).value;
}
class Rating {
constructor(voyage, history) {
this.voyage = voyage;
this.history = history;
}
```

<!-- Page 312 -->

```
get value() {
const vpf = this.voyageProfitFactor;
const vr = this.voyageRisk;
const chr = this.captainHistoryRisk;
if (vpf * 3 > (vr + chr * 2)) return "A";
else return "B";
}
get voyageRisk() {
let result = 1;
if (this.voyage.length > 4) result += 2;
if (this.voyage.length > 8) result += this.voyage.length 8;
if (["china", "eastindies"].includes(this.voyage.zone)) result += 4;
return Math.max(result, 0);
}
get captainHistoryRisk() {
let result = 1;
if (this.history.length < 5) result += 4;
result += this.history.filter(v => v.profit < 0).length;
if (this.voyage.zone === "china" && this.hasChinaHistory) result = 2;
return Math.max(result, 0);
}
get voyageProfitFactor() {
let result = 2;
if (this.voyage.zone === "china") result += 1;
if (this.voyage.zone === "eastindies") result += 1;
if (this.voyage.zone === "china" && this.hasChinaHistory) {
result += 3;
if (this.history.length > 10) result += 1;
if (this.voyage.length > 12) result += 1;
if (this.voyage.length > 18) result = 1;
}
else {
if (this.history.length > 8) result += 1;
if (this.voyage.length > 14) result = 1;
}
return result;
}
get hasChinaHistory() {
return this.history.some(v => "china" === v.zone);
}
}
```
That’s given me the class for the base case. I now need to create an empty subclass to house the variant behavior.
```
class ExperiencedChinaRating extends Rating {
}
```

<!-- Page 313 -->

I then create a factory function to return the variant class when needed.
```
function createRating(voyage, history) {
if (voyage.zone === "china" && history.some(v => "china" === v.zone))
return new ExperiencedChinaRating(voyage, history);
else return new Rating(voyage, history);
}
```
I need to modify any callers to use the factory function instead of directly invoking the constructor, which in this case is just the rating function.
```
function rating(voyage, history) {
return createRating(voyage, history).value;
}
```
There are two bits of behavior I need to move into a subclass. I begin with the logic in captainHistoryRisk:

*class Rating…*
```
get captainHistoryRisk() {
let result = 1;
if (this.history.length < 5) result += 4;
result += this.history.filter(v => v.profit < 0).length;
if (this.voyage.zone === "china" && this.hasChinaHistory) result = 2;
return Math.max(result, 0);
}
```
I write the overriding method in the subclass:

*class ExperiencedChinaRating*
```
get captainHistoryRisk() {
```

<!-- Page 314 -->

```
const result = super.captainHistoryRisk 2;
return Math.max(result, 0);
}
```
*class Rating…*
```
get captainHistoryRisk() {
let result = 1;
if (this.history.length < 5) result += 4;
result += this.history.filter(v => v.profit < 0).length;
if (this.voyage.zone === "china" && this.hasChinaHistory) result = 2;
return Math.max(result, 0);
}
```
Separating the variant behavior from voyageProfitFactor is a bit more messy. I can’t simply remove the variant behavior and call the superclass method since there is an alternative path here. I also don’t want to copy the whole superclass method down to the subclass.

*class Rating…*
```
get voyageProfitFactor() {
let result = 2;
if (this.voyage.zone === "china") result += 1;
if (this.voyage.zone === "eastindies") result += 1;
if (this.voyage.zone === "china" && this.hasChinaHistory) {
result += 3;
if (this.history.length > 10) result += 1;
if (this.voyage.length > 12) result += 1;
if (this.voyage.length > 18) result = 1;
}
else {
if (this.history.length > 8) result += 1;
if (this.voyage.length > 14) result = 1;
}
return result;
}
```
So my response is to first use *Extract Function (106)* on the entire conditional block.

<!-- Page 315 -->

*class Rating…*
```
get voyageProfitFactor() {
let result = 2;
if (this.voyage.zone === "china") result += 1;
if (this.voyage.zone === "eastindies") result += 1;
result += this.voyageAndHistoryLengthFactor;
return result;
}
get voyageAndHistoryLengthFactor() {
let result = 0;
if (this.voyage.zone === "china" && this.hasChinaHistory) {
result += 3;
if (this.history.length > 10) result += 1;
if (this.voyage.length > 12) result += 1;
if (this.voyage.length > 18) result = 1;
}
else {
if (this.history.length > 8) result += 1;
if (this.voyage.length > 14) result = 1;
}
return result;
}
```
A function name with an “And” in it is a pretty bad smell, but I’ll let it sit and reek for a moment, while I apply the subclassing.

*class Rating…*
```
get voyageAndHistoryLengthFactor() {
let result = 0;
if (this.history.length > 8) result += 1;
if (this.voyage.length > 14) result = 1;
return result;
}
```
*class ExperiencedChinaRating…*
```
get voyageAndHistoryLengthFactor() {
```

<!-- Page 316 -->

```
let result = 0;
result += 3;
if (this.history.length > 10) result += 1;
if (this.voyage.length > 12) result += 1;
if (this.voyage.length > 18) result = 1;
return result;
}
```
That’s, formally, the end of the refactoring—I’ve separated the variant behavior out into the subclass. The superclass’s logic is simpler to understand and work with, and I only need to deal with variant case when I’m working on the subclass code, which is expressed in terms of its difference with the superclass.

But I feel I should at least outline what I’d do with the awkward new method. Introducing a method purely for overriding by a subclass is a common thing to do when doing this kind of baseandvariation inheritance. But a crude method like this obscures what’s going on, instead of revealing.

The “And” gives away that there are really two separate modifications going on here—so I think it’s wise to separate them. I’ll do this by using *Extract Function (106)* on the history length modification, both in the superclass and subclass. I start with just the superclass:

*class Rating…*
```
get voyageAndHistoryLengthFactor() {
let result = 0;
result += this.historyLengthFactor;
if (this.voyage.length > 14) result = 1;
return result;
}
get historyLengthFactor() {
return (this.history.length > 8)? 1 : 0;
}
```
I do the same with the subclass:

*class ExperiencedChinaRating…*
```
get voyageAndHistoryLengthFactor() {
```

<!-- Page 317 -->

```
let result = 0;
result += 3;
result += this.historyLengthFactor;
if (this.voyage.length > 12) result += 1;
if (this.voyage.length > 18) result = 1;
return result;
}
get historyLengthFactor() {
return (this.history.length > 10)? 1 : 0;
}
```
I can then use *Move Statements to Callers (217)* on the superclass case.

*class Rating…*
```
get voyageProfitFactor() {
let result = 2;
if (this.voyage.zone === "china") result += 1;
if (this.voyage.zone === "eastindies") result += 1;
result += this.historyLengthFactor;
result += this.voyageAndHistoryLengthFactor;
return result;
}
get voyageAndHistoryLengthFactor() {
let result = 0;
result += this.historyLengthFactor;
if (this.voyage.length > 14) result = 1;
return result;
}
```
*class ExperiencedChinaRating…*
```
get voyageAndHistoryLengthFactor() {
let result = 0;
result += 3;
result += this.historyLengthFactor;
if (this.voyage.length > 12) result += 1;
if (this.voyage.length > 18) result = 1;
return result;
}
```
##### I’d then use Rename Function (124).

<!-- Page 318 -->

*class Rating…*
```
get voyageProfitFactor() {
let result = 2;
if (this.voyage.zone === "china") result += 1;
if (this.voyage.zone === "eastindies") result += 1;
result += this.historyLengthFactor;
result += this.voyageLengthFactor;
return result;
}
get voyageLengthFactor() {
return (this.voyage.length > 14)? 1: 0;
}
```
*Changing to a ternary to simplify* voyageLengthFactor.

*class ExperiencedChinaRating…*
```
get voyageLengthFactor() {
let result = 0;
result += 3;
if (this.voyage.length > 12) result += 1;
if (this.voyage.length > 18) result = 1;
return result;
}
```
One last thing. I don’t think adding 3 points makes sense as part of the voyage length factor—it’s better added to the overall result.

*class ExperiencedChinaRating…*
```
get voyageProfitFactor() {
return super.voyageProfitFactor + 3;
}
get voyageLengthFactor() {
let result = 0;
result += 3;
if (this.voyage.length > 12) result += 1;
```

<!-- Page 319 -->

```
if (this.voyage.length > 18) result = 1;
return result;
}
```
At the end of the refactoring, I have the following code. First, there is the basic rating class which can ignore any complications of the experienced China case:
```
class Rating {
constructor(voyage, history) {
this.voyage = voyage;
this.history = history;
}
get value() {
const vpf = this.voyageProfitFactor;
const vr = this.voyageRisk;
const chr = this.captainHistoryRisk;
if (vpf * 3 > (vr + chr * 2)) return "A";
else return "B";
}
get voyageRisk() {
let result = 1;
if (this.voyage.length > 4) result += 2;
if (this.voyage.length > 8) result += this.voyage.length 8;
if (["china", "eastindies"].includes(this.voyage.zone)) result += 4;
return Math.max(result, 0);
}
get captainHistoryRisk() {
let result = 1;
if (this.history.length < 5) result += 4;
result += this.history.filter(v => v.profit < 0).length;
return Math.max(result, 0);
}
get voyageProfitFactor() {
let result = 2;
if (this.voyage.zone === "china") result += 1;
if (this.voyage.zone === "eastindies") result += 1;
result += this.historyLengthFactor;
result += this.voyageLengthFactor;
return result;
}
get voyageLengthFactor() {
return (this.voyage.length > 14)? 1: 0;
}
get historyLengthFactor() {
return (this.history.length > 8)? 1 : 0;
}
}
```

<!-- Page 320 -->

The code for the experienced China case reads as a set of variations on the base:
```
class ExperiencedChinaRating extends Rating {
get captainHistoryRisk() {
const result = super.captainHistoryRisk 2;
return Math.max(result, 0);
}
get voyageLengthFactor() {
let result = 0;
if (this.voyage.length > 12) result += 1;
if (this.voyage.length > 18) result = 1;
return result;
}
get historyLengthFactor() {
return (this.history.length > 10)? 1 : 0;
}
get voyageProfitFactor() {
return super.voyageProfitFactor + 3;
}
}
```
### INTRODUCE SPECIAL CASE

##### formerly: Introduce Null Object

#### Motivation

A common case of duplicated code is when many users of a data structure check a specific value, and then most of them do the same thing. If I find many parts of the code

<!-- Page 321 -->

base having the same reaction to a particular value, I want to bring that reaction into a single place.

A good mechanism for this is the Special Case pattern where I create a specialcase element that captures all the common behavior. This allows me to replace most of the specialcase checks with simple calls.

A special case can manifest itself in several ways. If all I’m doing with the object is reading data, I can supply a literal object with all the values I need filled in. If I need more behavior than simple values, I can create a special object with methods for all the common behavior. The specialcase object can be returned by an encapsulating class, or inserted into a data structure with a transform.

A common value that needs specialcase processing is null, which is why this pattern is often called the Null Object pattern. But it’s the same approach for any special case—I like to say that Null Object is a special case of Special Case.

#### Mechanics

Begin with a container data structure (or class) that contains a property which is the subject of the refactoring. Clients of the container compare the subject property of the container to a specialcase value. We wish to replace the specialcase value of the subject with a special case class or data structure.

Add a specialcase check property to the subject, returning false.

Create a specialcase object with only the specialcase check property, returning true.

Apply *Extract Function (106)* to the specialcase comparison code. Ensure that all clients use the new function instead of directly comparing it.

Introduce the new specialcase subject into the code, either by returning it from a function call or by applying a transform function.

Change the body of the specialcase comparison function so that it uses the special case check property.

Test.

Use *Combine Functions into Class (144)* or *Combine Functions into Transform* *(149)* to move all of the common specialcase behavior into the new element.

<!-- Page 322 -->

Since the specialcase class usually returns fixed values to simple requests, these may be handled by making the special case a literal record.

Use *Inline Function (115)* on the specialcase comparison function for the places where it’s still needed.

#### Example

A utility company installs its services in sites.

*class Site…*
```
get customer() {return this._customer;}
```

There are various properties of the customer class; I’ll consider three of them.

*class Customer…*
```
get name() {...}
get billingPlan() {...}
set billingPlan(arg) {...}
get paymentHistory() {...}
```

Most of the time, a site has a customer, but sometimes there isn’t one. Someone may have moved out and I don’t yet know who, if anyone, has moved in. When this happens, the data record fills the customer field with the string “unknown”. Because this can happen, clients of the site need to be able to handle an unknown customer. Here are some example fragments:

*client 1…*
```
const aCustomer = site.customer;
// ... lots of intervening code ...
let customerName;
if (aCustomer === "unknown") customerName = "occupant";
else customerName = aCustomer.name;
```

*client 2…*

<!-- Page 323 -->

```
const plan = (aCustomer === "unknown")?
registry.billingPlans.basic
: aCustomer.billingPlan;
```
*client 3…*
```
if (aCustomer!== "unknown") aCustomer.billingPlan = newPlan;
```
*client 4…*
```
const weeksDelinquent = (aCustomer === "unknown")?
0
: aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
Looking through the code base, I see many clients of the site object that have to deal with an unknown customer. Most of them do the same thing when they get one: They use “occupant” as the name, give them a basic billing plan, and class them as zero weeks delinquent. This widespread testing for a special case, plus a common response, is what tells me it’s time for a Special Case Object.

I begin by adding a method to the customer to indicate it is unknown.

*class Customer…*

```
get isUnknown() {return false;}
```
I then add an Unknown Customer class.
```
class UnknownCustomer {
get isUnknown() {return true;}
}
```

<!-- Page 324 -->

Note that I don’t make UnknownCustomer a subclass of Customer. In other languages, particularly those statically typed, I would, but JavaScript’s rules for subclassing, as well as its dynamic typing, make it better to not do that here.

Now comes the tricky bit. I have to return this new specialcase object whenever I expect "unknown" and change each test for an unknown value to use the new isUnknown method. In general, I always want to arrange things so I can make one small change at a time, then test. But if I change the customer class to return an unknown customer instead of “unknown”, I have to make every client testing for “unknown” to call isUnknown—and I have to do it all at once. I find that as appealing as eating liver (i.e., not at all).

There is a common technique to use whenever I find myself in this bind. I use *Extract* *Function (106)* on the code that I’d have to change in lots of places—in this case, the specialcase comparison code.
```
function isUnknown(arg) {
if (!((arg instanceof Customer) || (arg === "unknown")))
throw new Error(`investigate bad value: <${arg}>`);
return (arg === "unknown");
}
```
I’ve put a trap in here for an unexpected value. This can help me to spot any mistakes or odd behavior as I’m doing this refactoring.

I can now use this function whenever I’m testing for an unknown customer. I can change these calls one at a time, testing after each change.

*client 1…*
```
let customerName;
if (isUnknown(aCustomer)) customerName = "occupant";
else customerName = aCustomer.name;
```
After a while, I have done them all.

*client 2…*

<!-- Page 325 -->

```
const plan = (isUnknown(aCustomer))?
registry.billingPlans.basic
: aCustomer.billingPlan;
```
*client 3…*
```
if (!isUnknown(aCustomer)) aCustomer.billingPlan = newPlan;
```
*client 4…*
```
const weeksDelinquent = isUnknown(aCustomer)?
0
: aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
Once I’ve changed all the callers to use isUnknown, I can change the site class to return an unknown customer.

*class Site…*
```
get customer() {
return (this._customer === "unknown")? new UnknownCustomer() : this._customer;
}
```
I can check that I’m no longer using the “unknown” string by changing isUnknown to use the unknown value.

*client 1…*
```
function isUnknown(arg) {
if (!(arg instanceof Customer || arg instanceof UnknownCustomer))
throw new Error(`investigate bad value: <${arg}>`);
```

<!-- Page 326 -->

```
return arg.isUnknown;
}
```
I test to ensure that’s all working.

Now the fun begins. I can use *Combine Functions* i*nto Class (144)* to take each client’s specialcase check and see if I can replace it with a commonly expected value. At the moment, I have various clients using “occupant” for the name of an unknown customer, like this:

*client 1…*
```
let customerName;
if (isUnknown(aCustomer)) customerName = "occupant";
else customerName = aCustomer.name;
```
I add a suitable method to the unknown customer:

*class UnknownCustomer…*
```
get name() {return "occupant";}
```
Now I can make all that conditional code go away.

*client 1…*
```
const customerName = aCustomer.name;
```
Once I’ve tested that this works, I’ll probably be able to use *Inline Variable (123)* on that variable too.

Next is the billing plan property.

*client 2…*

<!-- Page 327 -->

```
const plan = (isUnknown(aCustomer))?
registry.billingPlans.basic
: aCustomer.billingPlan;
```
*client 3…*
```
if (!isUnknown(aCustomer)) aCustomer.billingPlan = newPlan;
```
For read behavior, I do the same thing I did with the name—take the common response and reply with it. With the write behavior, the current code doesn’t call the setter for an unknown customer—so for the special case, I let the setter be called, but it does nothing.

*class UnknownCustomer…*
```
get billingPlan() {return registry.billingPlans.basic;}
set billingPlan(arg) { /* ignore */}
```
*client reader…*
```
const plan = aCustomer.billingPlan;
```
*client writer…*
```
aCustomer.billingPlan = newPlan;
```
Specialcase objects are value objects, and thus should always be immutable, even if the objects they are substituting for are not.

The last case is a bit more involved because the special case needs to return another

<!-- Page 328 -->

object that has its own properties.

*client…*
```
const weeksDelinquent = isUnknown(aCustomer)?
0
: aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
The general rule with a specialcase object is that if it needs to return related objects, they are usually special cases themselves. So here I need to create a null payment history.

*class UnknownCustomer…*
```
get paymentHistory() {return new NullPaymentHistory();}
```
*class NullPaymentHistory…*
```
get weeksDelinquentInLastYear() {return 0;}
```
*client…*
```
const weeksDelinquent = aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
I carry on, looking at all the clients to see if I can replace them with the polymorphic behavior. But there will be exceptions—clients that want to do something different with the special case. I may have 23 clients that use “occupant” for the name of an unknown customer, but there’s always one that needs something different.

*client…*

<!-- Page 329 -->

```
const name = ! isUnknown(aCustomer) ? aCustomer.name : "unknown occupant";
```

In that case, I need to retain a specialcase check. I will change it to use the method on customer, essentially using *Inline Function (115)* on isUnknown.

*client…*
```
const name = aCustomer.isUnknown ? "unknown occupant" : aCustomer.name;
```

When I’m done with all the clients, I should be able to use *Remove Dead Code (237)* on the global isPresent function, as nobody should be calling it any more.

#### Example: Using an Object Literal

Creating a class like this is a fair bit of work for what is really a simple value. But for the example I gave, I had to make the class since the customer could be updated. If, however, I only read the data structure, I can use a literal object instead.

Here is the opening case again—just the same, except this time there is no client that updates the customer:

*class Site…*
```
get customer() {return this._customer;}
```

*class Customer…*
```
get name() {...}
get billingPlan() {...}
set billingPlan(arg) {...}
get paymentHistory() {...}
```

*client 1…*

<!-- Page 330 -->

```
const aCustomer = site.customer;
//... lots of intervening code...
let customerName;
if (aCustomer === "unknown") customerName = "occupant";
else customerName = aCustomer.name;
```
*client 2…*
```
const plan = (aCustomer === "unknown")?
registry.billingPlans.basic
: aCustomer.billingPlan;
```
*client 3…*
```
const weeksDelinquent = (aCustomer === "unknown")?
0
: aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
As with the previous case, I start by adding an isUnknown property to the customer and creating a specialcase object with that field. The difference is that this time, the special case is a literal.

*class Customer…*

```
get isUnknown() {return false;}
```
*top level…*
```
function createUnknownCustomer() {
return {
isUnknown: true,
};
}
```
I apply *Extract Function (106)* to the special case condition test.

<!-- Page 331 -->

```
function isUnknown(arg) {
return (arg === "unknown");
}
```
*client 1…*
```
let customerName;
if (isUnknown(aCustomer)) customerName = "occupant";
else customerName = aCustomer.name;
```
*client 2…*
```
const plan = isUnknown(aCustomer)?
registry.billingPlans.basic
: aCustomer.billingPlan;
```
*client 3…*
```
const weeksDelinquent = isUnknown(aCustomer)?
0
: aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
I change the site class and the condition test to work with the special case.

*class Site…*
```
get customer() {
return (this._customer === "unknown")? createUnknownCustomer() : this._customer;
}
```
*top level…*

<!-- Page 332 -->

```
function isUnknown(arg) {
return arg.isUnknown;
}
```
Then I replace each standard response with the appropriate literal value. I start with the name:
```
function createUnknownCustomer() {
return {
isUnknown: true,
name: "occupant",
};
}
```
*client 1…*
```
const customerName = aCustomer.name;
```
Then, the billing plan:
```
function createUnknownCustomer() {
return {
isUnknown: true,
name: "occupant",
billingPlan: registry.billingPlans.basic,
};
}
```
*client 2…*
```
const plan = aCustomer.billingPlan;
```

<!-- Page 333 -->

Similarly, I can create a nested null payment history with the literal:
```
function createUnknownCustomer() {
return {
isUnknown: true,
name: "occupant",
billingPlan: registry.billingPlans.basic,
paymentHistory: {
weeksDelinquentInLastYear: 0,
},
};
}
```
*client 3…*
```
const weeksDelinquent = aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
If I use a literal like this, I should make it immutable, which I might do with freeze. Usually, I’d rather use a class.

#### Example: Using a Transform

Both previous cases involve a class, but the same idea can be applied to a record by using a transform step.

Let’s assume our input is a simple record structure that looks something like this:
```
{
name: "Acme Boston",
location: "Malden MA",
// more site details
customer: {
name: "Acme Industries",
billingPlan: "plan451",
paymentHistory: {
weeksDelinquentInLastYear: 7
//more
},
// more
```

<!-- Page 334 -->

```
}
}
```
In some cases, the customer isn’t known, and such cases are marked in the same way:
```
{
name: "Warehouse Unit 15",
location: "Malden MA",
// more site details
customer: "unknown",
}
```
I have similar client code that checks for the unknown customer:

*client 1…*
```
const site = acquireSiteData();
const aCustomer = site.customer;
//... lots of intervening code...
let customerName;
if (aCustomer === "unknown") customerName = "occupant";
else customerName = aCustomer.name;
```
*client 2…*
```
const plan = (aCustomer === "unknown")?
registry.billingPlans.basic
: aCustomer.billingPlan;
```
*client 3…*
```
const weeksDelinquent = (aCustomer === "unknown")?
: aCustomer.paymentHistory.weeksDelinquentInLastYear;
```

<!-- Page 335 -->

My first step is to run the site data structure through a transform that, currently, does nothing but a deep copy.

*client 1…*
```
const rawSite = acquireSiteData();
const site = enrichSite(rawSite);
const aCustomer = site.customer;
//... lots of intervening code...
let customerName;
if (aCustomer === "unknown") customerName = "occupant";
else customerName = aCustomer.name;
function enrichSite(inputSite) {
return _.cloneDeep(inputSite);
}
```
I apply *Extract Function (106)* to the test for an unknown customer.
```
function isUnknown(aCustomer) {
return aCustomer === "unknown";
}
```
*client 1…*
```
const rawSite = acquireSiteData();
const site = enrichSite(rawSite);
const aCustomer = site.customer;
//... lots of intervening code...
let customerName;
if (isUnknown(aCustomer)) customerName = "occupant";
else customerName = aCustomer.name;
```
*client 2…*
```
const plan = (isUnknown(aCustomer))?
```

<!-- Page 336 -->

```
registry.billingPlans.basic
: aCustomer.billingPlan;
```
*client 3…*
```
const weeksDelinquent = (isUnknown(aCustomer))?
0
: aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
I begin the enrichment by adding an isUnknown property to the customer.
```
function enrichSite(aSite) {
const result = _.cloneDeep(aSite);
const unknownCustomer = {
isUnknown: true,
};
if (isUnknown(result.customer)) result.customer = unknownCustomer;
else result.customer.isUnknown = false;
return result;
}
```
I can then modify the specialcase condition test to include probing for this new property. I keep the original test as well, so that the test will work on both raw and enriched sites.
```
function isUnknown(aCustomer) {
if (aCustomer === "unknown") return true;
else return aCustomer.isUnknown;
}
```
I test to ensure that’s all OK, then start applying *Combine Functions* i*nto Transform* *(149)* on the special case. First, I move the choice of name into the enrichment function.
```
function enrichSite(aSite) {
```

<!-- Page 337 -->

```
const result = _.cloneDeep(aSite);
const unknownCustomer = {
isUnknown: true,
name: "occupant",
};
if (isUnknown(result.customer)) result.customer = unknownCustomer;
else result.customer.isUnknown = false;
return result;
}
```

*client 1…*
```
const rawSite = acquireSiteData();
const site = enrichSite(rawSite);
const aCustomer = site.customer;
// ... lots of intervening code ...
const customerName = aCustomer.name;
```

I test, then do the billing plan.
```
function enrichSite(aSite) {
const result = _.cloneDeep(aSite);
const unknownCustomer = {
isUnknown: true,
name: "occupant",
billingPlan: registry.billingPlans.basic,
};
if (isUnknown(result.customer)) result.customer = unknownCustomer;
else result.customer.isUnknown = false;
return result;
}
```

*client 2…*
```
const plan = aCustomer.billingPlan;
```

I test again, then do the last client.

<!-- Page 338 -->

```
function enrichSite(aSite) {
const result = _.cloneDeep(aSite);
const unknownCustomer = {
isUnknown: true,
name: "occupant",
billingPlan: registry.billingPlans.basic,
paymentHistory: {
weeksDelinquentInLastYear: 0,
}
};
if (isUnknown(result.customer)) result.customer = unknownCustomer;
else result.customer.isUnknown = false;
return result;
}
```
*client 3…*
```
const weeksDelinquent = aCustomer.paymentHistory.weeksDelinquentInLastYear;
```
### INTRODUCE ASSERTION

#### Motivation

Often, sections of code work only if certain conditions are true. This may be as simple as a square root calculation only working on a positive input value. With an object, it

<!-- Page 339 -->

may require that at least one of a group of fields has a value in it.

Such assumptions are often not stated but can only be deduced by looking through an algorithm. Sometimes, the assumptions are stated with a comment. A better technique is to make the assumption explicit by writing an assertion.

An assertion is a conditional statement that is assumed to be always true. Failure of an assertion indicates a programmer error. Assertion failures should never be checked by other parts of the system. Assertions should be written so that the program functions equally correctly if they are all removed; indeed, some languages provide assertions that can be disabled by a compiletime switch.

I often see people encourage using assertions in order to find errors. While this is certainly a Good Thing, it’s not the only reason to use them. I find assertions to be a valuable form of communication—they tell the reader something about the assumed state of the program at this point of execution. I also find them handy for debugging, and their communication value means I’m inclined to leave them in once I’ve fixed the error I’m chasing. Selftesting code reduces their value for debugging, as steadily narrowing unit tests often do the job better, but I still like assertions for communication.

#### Mechanics

When you see that a condition is assumed to be true, add an assertion to state it.

Since assertions should not affect the running of a system, adding one is always behaviorpreserving.

#### Example

Here’s a simple tale of discounts. A customer can be given a discount rate to apply to all their purchases:

*class Customer…*
```
applyDiscount(aNumber) {
return (this.discountRate)
? aNumber (this.discountRate * aNumber)
: aNumber;
}
```

<!-- Page 340 -->

There’s an assumption here that the discount rate is a positive number. I can make that assumption explicit by using an assertion. But I can’t easily place an assertion into a ternary expression, so first I’ll reformulate it as an ifthen statement.

*class Customer…*
```
applyDiscount(aNumber) {
if (!this.discountRate) return aNumber;
else return aNumber (this.discountRate * aNumber);
}
```
Now I can easily add the assertion.

*class Customer…*
```
applyDiscount(aNumber) {
if (!this.discountRate) return aNumber;
else {
assert(this.discountRate >= 0);
return aNumber (this.discountRate * aNumber);
}
}
```
In this case, I’d rather put this assertion into the setting method. If the assertion fails in applyDiscount, my first puzzle is how it got into the field in the first place.

*class Customer…*
```
set discountRate(aNumber) {
assert(null === aNumber || aNumber >= 0);
this._discountRate = aNumber;
}
```
An assertion like this can be particularly valuable if it’s hard to spot the error source— which may be an errant minus sign in some input data or some inversion elsewhere in the code.

<!-- Page 341 -->

There is a real danger of overusing assertions. I don’t use assertions to check everything that I think is true, but only to check things that *need* to be true. Duplication is a particular problem, as it’s common to tweak these kinds of conditions. So I find it’s essential to remove any duplication in these conditions, usually by a liberal use of *Extract Function (106)*.

I only use assertions for things that are programmer errors. If I’m reading data from an external source, any value checking should be a firstclass part of the program, not an assertion—unless I’m really confident in the external source. Assertions are a last resort to help track bugs—though, ironically, I only use them when I think they should never fail.
