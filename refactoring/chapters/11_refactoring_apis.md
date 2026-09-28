# Chapter 11: Refactoring APIs

> **Pages:** 342 – 388
> **Summary:** Separate Query from Modifier, Parameterize Function, Remove Flag Argument, Preserve Whole Object, Replace Parameter with Query, Replace Query with Parameter, Remove Setting Method, Replace Constructor with Factory Function, Replace Function with Command, Replace Command with Function.

---

## Chapter 11 Refactoring APIs

Modules and their functions are the building blocks of our software. APIs are the joints that we use to plug them together. Making these APIs easy to understand and use is important but also difficult: I need to refactor them as I learn how to improve them. A good API clearly separates any functions that update data from those that only read data. If I see them combined, I use *Separate Query from Modifier (306)* to tease them apart. I can unify functions that only vary due to a value with *Parameterize Function (310)*. Some parameters, however, are really just a signal of an entirely different behavior and are best excised with *Remove Flag Argument (314)*. Data structures are often unpacked unnecessarily when passed between functions; I prefer to keep them together with *Preserve Whole Object (319)*. Decisions on what should be passed as a parameter, and what can be resolved by the called function, are ones I often need to revisit with *Replace Parameter with Query (324)* and *Replace* *Query with Parameter (327)*.

A class is a common form of module. I prefer my objects to be as immutable as possible, so I use *Remove Setting Method (331)* whenever I can. Often, when a caller asks for a new object, I need more flexibility than a simple constructor gives, which I can get by using *Replace Constructor with Factory Function (334)*.

The last two refactorings address the difficulty of breaking down a particularly complex function that passes a lot of data around. I can turn that function into an object with *Replace Function with Command (337)*, which makes it easier to use *Extract Function* *(106)* on the function’s body. If I later simplify the function and no longer need it as a command object, I turn it back into a function with *Replace Command with Function* *(344)*.

### SEPARATE QUERY FROM MODIFIER

<!-- Page 343 -->

#### Motivation

When I have a function that gives me a value and has no observable side effects, I have a very valuable thing. I can call this function as often as I like. I can move the call to other places in a calling function. It’s easier to test. In short, I have a lot less to worry about.

It is a good idea to clearly signal the difference between functions with side effects and those without. A good rule to follow is that any function that returns a value should not have observable side effects—the commandquery separation [mfcqs]. Some programmers treat this as an absolute rule. I’m not 100 percent pure on this (as on anything), but I try to follow it most of the time, and it has served me well.

If I come across a method that returns a value but also has side effects, I always try to separate the query from the modifier.

Note that I use the phrase *observable* side effects. A common optimization is to cache the value of a query in a field so that repeated calls go quicker. Although this changes the state of the object with the cache, the change is not observable. Any sequence of queries will always return the same results for each query.

#### Mechanics

<!-- Page 344 -->

Copy the function, name it as a query.

Look into the function to see what is returned. If the query is used to populate a variable, the variable’s name should provide a good clue.

Remove any side effects from the new query function.

##### Run static checks.

Find each call of the original method. If that call uses the return value, replace the original call with a call to the query and insert a call to the original method below it. Test after each change.

##### Remove return values from original.

Test.

Often after doing this there will be duplication between the query and the original method that can be tidied up.

#### Example

Here is a function that scans a list of names for a miscreant. If it finds one, it returns the name of the bad guy and sets off the alarms. It only does this for the first miscreant it finds (I guess one is enough).
```
function alertForMiscreant (people) {
for (const p of people) {
if (p === "Don") {
setOffAlarms();
return "Don";
}
if (p === "John") {
setOffAlarms();
return "John";
}
}
return "";
}
```
I begin by copying the function, naming it after the query aspect of the function.

<!-- Page 345 -->

```
function findMiscreant (people) {
for (const p of people) {
if (p === "Don") {
setOffAlarms();
return "Don";
}
if (p === "John") {
setOffAlarms();
return "John";
}
}
return "";
}
```
I remove the side effects from this new query.
```
function findMiscreant (people) {
for (const p of people) {
if (p === "Don") {
setOffAlarms();
return "Don";
}
if (p === "John") {
setOffAlarms();
return "John";
}
}
return "";
}
```
I now go to each caller and replace it with a call to the query, followed by a call to the modifier. So
```
const found = alertForMiscreant(people);
```
changes to
```
const found = findMiscreant(people);
alertForMiscreant(people);
```

<!-- Page 346 -->

I now remove the return values from the modifier.
```
function alertForMiscreant (people) {
for (const p of people) {
if (p === "Don") {
setOffAlarms();
return;
}
if (p === "John") {
setOffAlarms();
return;
}
}
return;
}
```
Now I have a lot of duplication between the original modifier and the new query, so I can use *Substitute Algorithm (195)* so that the modifier uses the query.
```
function alertForMiscreant (people) {
if (findMiscreant(people)!== "") setOffAlarms();
}
```
### PARAMETERIZE FUNCTION

##### formerly: Parameterize Method

<!-- Page 347 -->

#### Motivation

If I see two functions that carry out very similar logic with different literal values, I can remove the duplication by using a single function with parameters for the different values. This increases the usefulness of the function, since I can apply it elsewhere with different values.

#### Mechanics

Select one of the similar methods.

Use *Change Function Declaration (124)* to add any literals that need to turn into parameters.

For each caller of the function, add the literal value.

Test.

Change the body of the function to use the new parameters. Test after each change.

For each similar function, replace the call with a call to the parameterized function. Test after each one.

If the original parameterized function doesn’t work for a similar function, adjust it for the new function before moving on to the next.

#### Example

<!-- Page 348 -->

An obvious example is something like this:
```
function tenPercentRaise(aPerson) {
aPerson.salary = aPerson.salary.multiply(1.1);
}
function fivePercentRaise(aPerson) {
aPerson.salary = aPerson.salary.multiply(1.05);
}
```
Hopefully it’s obvious that I can replace these with
```
function raise(aPerson, factor) {
aPerson.salary = aPerson.salary.multiply(1 + factor);
}
```
But it can be a bit more involved than that. Consider this code:
```
function baseCharge(usage) {
if (usage < 0) return usd(0);
const amount =
bottomBand(usage) * 0.03
+ middleBand(usage) * 0.05
+ topBand(usage) * 0.07;
return usd(amount);
}
function bottomBand(usage) {
return Math.min(usage, 100);
}
function middleBand(usage) {
return usage > 100? Math.min(usage, 200) 100 : 0;
}
function topBand(usage) {
return usage > 200? usage 200 : 0;
}
```
Here the logic is clearly pretty similar—but is it similar enough to support creating a parameterized method for the bands? It is, but may be a touch less obvious than the

<!-- Page 349 -->

##### trivial case above.

When looking to parameterize some related functions, my approach is to take one of the functions and add parameters to it, with an eye to the other cases. With range oriented things like this, usually the place to start is with the middle range. So I’ll work on middleBand to change it to use parameters, and then adjust other callers to fit.

```
middleBand uses two literal values: 100 and 200. These represent the bottom and top
```
of this middle band. I begin by using *Change Function Declaration (124)* to add them to the call. While I’m at it, I’ll also change the name of the function to something that makes sense with the parameterization.
```
function withinBand(usage, bottom, top) {
return usage > 100? Math.min(usage, 200) 100 : 0;
}
function baseCharge(usage) {
if (usage < 0) return usd(0);
const amount =
bottomBand(usage) * 0.03
+ withinBand(usage, 100, 200) * 0.05
+ topBand(usage) * 0.07;
return usd(amount);
}
```
I replace each literal with a reference to the parameter:
```
function withinBand(usage, bottom, top) {
return usage > bottom? Math.min(usage, 200) bottom : 0;
}
```
then:
```
function withinBand(usage, bottom, top) {
return usage > bottom? Math.min(usage, top) bottom : 0;
}
```

<!-- Page 350 -->

I replace the call to the bottom band with a call to the newly parameterized function.
```
function baseCharge(usage) {
if (usage < 0) return usd(0);
const amount =
withinBand(usage, 0, 100) * 0.03
+ withinBand(usage, 100, 200) * 0.05
+ topBand(usage) * 0.07;
return usd(amount);
}
function bottomBand(usage) {
return Math.min(usage, 100);
}
```
To replace the call to the top band, I need to make use of infinity.
```
function baseCharge(usage) {
if (usage < 0) return usd(0);
const amount =
withinBand(usage, 0, 100) * 0.03
+ withinBand(usage, 100, 200) * 0.05
+ withinBand(usage, 200, Infinity) * 0.07;
return usd(amount);
}
function topBand(usage) {
return usage > 200? usage 200 : 0;
}
```
With the logic working the way it does now, I could remove the initial guard clause. But although it’s logically unnecessary now, I like to keep it as it documents how to handle that case.

### REMOVE FLAG ARGUMENT

##### formerly: Replace Parameter with Explicit Methods

<!-- Page 351 -->

#### Motivation

A flag argument is a function argument that the caller uses to indicate which logic the called function should execute. I may call a function that looks like this:
```
function bookConcert(aCustomer, isPremium) {
if (isPremium) {
// logic for premium booking
} else {
// logic for regular booking
}
}
```
To book a premium concert, I issue the call like so:

```
bookConcert(aCustomer, true);
```
Flag arguments can also come as enums:

<!-- Page 352 -->

```
bookConcert(aCustomer, CustomerType.PREMIUM);
```
or strings (or symbols in languages that use them):
```
bookConcert(aCustomer, "premium");
```
I dislike flag arguments because they complicate the process of understanding what function calls are available and how to call them. My first route into an API is usually the list of available functions, and flag arguments hide the differences in the function calls that are available. Once I select a function, I have to figure out what values are available for the flag arguments. Boolean flags are even worse since they don’t convey their meaning to the reader—in a function call, I can’t figure out what true means. It’s clearer to provide an explicit function for the task I want to do.

```
premiumBookConcert(aCustomer);
```
Not all arguments like this are flag arguments. To be a flag argument, the callers must be setting the boolean value to a literal value, not data that’s flowing through the program. Also, the implementation function must be using the argument to influence its control flow, not as data that it passes to further functions.

Removing flag arguments doesn’t just make the code clearer—it also helps my tooling. Code analysis tools can now more easily see the difference between calling the premium logic and calling regular logic.

Flag arguments can have a place if there’s more than one of them in the function, since otherwise I would need explicit functions for every combination of their values. But that’s also a signal of a function doing too much, and I should look for a way to create simpler functions that I can compose for this logic.

#### Mechanics

Create an explicit function for each value of the parameter.

If the main function has a clear dispatch conditional, use *Decompose Conditional* *(260)* to create the explicit functions. Otherwise, create wrapping functions.

<!-- Page 353 -->

For each caller that uses a literal value for the parameter, replace it with a call to the explicit function.

#### Example

Looking through some code, I see calls to calculate a delivery date for a shipment. Some of the calls look like
```
aShipment.deliveryDate = deliveryDate(anOrder, true);
```
##### and some look like
```
aShipment.deliveryDate = deliveryDate(anOrder, false);
```
Faced with code like this, I immediately begin to wonder about the meaning of the boolean value. What is it doing?

The body of deliveryDate looks like this:
```
function deliveryDate(anOrder, isRush) {
if (isRush) {
let deliveryTime;
if (["MA", "CT"].includes(anOrder.deliveryState)) deliveryTime = 1;
else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
else deliveryTime = 3;
return anOrder.placedOn.plusDays(1 + deliveryTime);
}
else {
let deliveryTime;
if (["MA", "CT", "NY"].includes(anOrder.deliveryState)) deliveryTime = 2;
else if (["ME", "NH"].includes(anOrder.deliveryState)) deliveryTime = 3;
else deliveryTime = 4;
return anOrder.placedOn.plusDays(2 + deliveryTime);
}
}
```
Here, the caller is using a literal boolean value to determine which code should run—a

<!-- Page 354 -->

classic flag argument. But the whole point of using a function is to follow the caller’s instructions, so it is better to clarify the caller’s intent with explicit functions.

In this case, I can do this by using *Decompose Conditional (260)*, which gives me this:
```
function deliveryDate(anOrder, isRush) {
if (isRush) return rushDeliveryDate(anOrder);
else return regularDeliveryDate(anOrder);
}
function rushDeliveryDate(anOrder) {
let deliveryTime;
if (["MA", "CT"].includes(anOrder.deliveryState)) deliveryTime = 1;
else if (["NY", "NH"].includes(anOrder.deliveryState)) deliveryTime = 2;
else deliveryTime = 3;
return anOrder.placedOn.plusDays(1 + deliveryTime);
}
function regularDeliveryDate(anOrder) {
let deliveryTime;
if (["MA", "CT", "NY"].includes(anOrder.deliveryState)) deliveryTime = 2;
else if (["ME", "NH"].includes(anOrder.deliveryState)) deliveryTime = 3;
else deliveryTime = 4;
return anOrder.placedOn.plusDays(2 + deliveryTime);
}
```
The two new functions capture the intent of the call better, so I can replace each call of
```
aShipment.deliveryDate = deliveryDate(anOrder, true);
```
with
```
aShipment.deliveryDate = rushDeliveryDate(anOrder);
```
##### and similarly with the other case.

When I’ve replaced all the callers, I remove deliveryDate.

A flag argument isn’t just the presence of a boolean value; it’s that the boolean is set

<!-- Page 355 -->

with a literal rather than data. If all the callers of deliveryDate were like this:
```
const isRush = determineIfRush(anOrder);
aShipment.deliveryDate = deliveryDate(anOrder, isRush);
```
then I’d have no problem with deliveryDate’s signature (although I’d still want to apply *Decompose Conditional (260)*).

It may be that some callers use the argument as a flag argument by setting it with a literal, while others set the argument with data. In this case, I’d still use Remove Flag Argument, but not change the data callers and not remove deliveryDate at the end. That way I support both interfaces for the different uses.

Decomposing the conditional like this is a good way to carry out this refactoring, but it only works if the dispatch on the parameter is the outer part of the function (or I can easily refactor it to make it so). It’s also possible that the parameter is used in a much more tangled way, such as this alternative version of deliveryDate:
```
function deliveryDate(anOrder, isRush) {
let result;
let deliveryTime;
if (anOrder.deliveryState === "MA" || anOrder.deliveryState === "CT")
deliveryTime = isRush? 1 : 2;
else if (anOrder.deliveryState === "NY" || anOrder.deliveryState === "NH") {
deliveryTime = 2;
if (anOrder.deliveryState === "NH" &&!isRush)
deliveryTime = 3;
}
else if (isRush)
deliveryTime = 3;
else if (anOrder.deliveryState === "ME")
deliveryTime = 3;
else
deliveryTime = 4;
result = anOrder.placedOn.plusDays(2 + deliveryTime);
if (isRush) result = result.minusDays(1);
return result;
}
```
In this case, teasing out isRush into a toplevel dispatch conditional is likely more

<!-- Page 356 -->

work than I fancy. So instead, I can layer functions over the deliveryDate:
```
function rushDeliveryDate (anOrder) {return deliveryDate(anOrder, true);}
function regularDeliveryDate(anOrder) {return deliveryDate(anOrder, false);}
```
These wrapping functions are essentially partial applications of deliveryDate, although they are defined in program text rather than by composition of functions.

I can then do the same replacement of callers that I did with the decomposed conditional earlier on. If there aren’t any callers using the parameter as data, I like to restrict its visibility or rename it to a name that conveys that it shouldn’t be used directly (e.g., deliveryDateHelperOnly).

### PRESERVE WHOLE OBJECT

#### Motivation

If I see code that derives a couple of values from a record and then passes these values into a function, I like to replace those values with the whole record itself, letting the function body derive the values it needs.

Passing the whole record handles change better should the called function need more data from the whole in the future—that change would not require me to alter the parameter list. It also reduces the size of the parameter list, which usually makes the

<!-- Page 357 -->

function call easier to understand. If many functions are called with the parts, they often duplicate the logic that manipulates these parts—logic that can often be moved to the whole.

The main reason I wouldn’t do this is if I don’t want the called function to have a dependency on the whole—which typically occurs when they are in different modules.

Pulling several values from an object to do some logic on them alone is a smell (*Feature* *Envy (77)*), and usually a signal that this logic should be moved into the whole itself. Preserve Whole Object is particularly common after I’ve done *Introduce Parameter* *Object (140)*, as I hunt down any occurrences of the original data clump to replace them with the new object.

If several bits of code only use the same subset of an object’s features, then that may indicate a good opportunity for *Extract Class (182)*.

One case that many people miss is when an object calls another object with several of its own data values. If I see this, I can replace those values with a selfreference (this in JavaScript).

#### Mechanics

Create an empty function with the desired parameters.

Give the function an easily searchable name so it can be replaced at the end.

Fill the body of the new function with a call to the old function, mapping from the new parameters to the old ones.

##### Run static checks.

Adjust each caller to use the new function, testing after each change.

This may mean that some code that derives the parameter isn’t needed, so can fall to *Remove Dead Code (237)*.

Once all original callers have been changed, use *Inline Function (115)* on the original function.

Change the name of the new function and all its callers.

#### Example

<!-- Page 358 -->

Consider a room monitoring system. It compares its daily temperature range with a range in a predefined heating plan.

*caller…*
```
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.withinRange(low, high))
alerts.push("room temperature went outside range");
```
*class HeatingPlan…*
```
withinRange(bottom, top) {
return (bottom >= this._temperatureRange.low) && (top <= this._temperatureRange.high);
}
```
Instead of unpacking the range information when I pass it in, I can pass in the whole range object.

I begin by stating the interface I want as an empty function.

*class HeatingPlan…*
```
xxNEWwithinRange(aNumberRange) {
}
```
Since I intend it to replace the existing withinRange, I name it the same but with an easily replaceable prefix.

I then add the body of the function, which relies on calling the existing withinRange. The body thus consists of a mapping from the new parameter to the existing ones.

*class HeatingPlan…*

<!-- Page 359 -->

```
xxNEWwithinRange(aNumberRange) {
return this.withinRange(aNumberRange.low, aNumberRange.high);
}
```
Now I can begin the serious work, taking the existing function calls and having them call the new function.

*caller…*
```
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.xxNEWwithinRange(aRoom.daysTempRange))
alerts.push("room temperature went outside range");
```
When I’ve changed the calls, I may see that some of the earlier code isn’t needed anymore, so I wield *Remove Dead Code (237)*.

*caller…*
```
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.xxNEWwithinRange(aRoom.daysTempRange))
alerts.push("room temperature went outside range");
```
I replace these one at a time, testing after each change.

Once I’ve replaced them all, I can use *Inline Function (115)* on the original function.

*class HeatingPlan…*
```
xxNEWwithinRange(aNumberRange) {
return (aNumberRange.low >= this._temperatureRange.low) &&
(aNumberRange.high <= this._temperatureRange.high);
}
```
And I finally remove that ugly prefix from the new function and all its callers. The prefix

<!-- Page 360 -->

makes it a simple global replace, even if I don’t have a robust rename support in my editor.

*class HeatingPlan…*
```
withinRange(aNumberRange) {
return (aNumberRange.low >= this._temperatureRange.low) &&
(aNumberRange.high <= this._temperatureRange.high);
}
```
*caller…*
```
if (!aPlan.withinRange(aRoom.daysTempRange))
alerts.push("room temperature went outside range");
```
#### Example: A Variation to Create the New Function

In the above example, I wrote the code for the new function directly. Most of the time, that’s pretty simple and the easiest way to go. But there is a variation on this that’s occasionally useful—which can allow me to compose the new function entirely from refactorings.

I start with a caller of the existing function.

*caller…*
```
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
if (!aPlan.withinRange(low, high))
alerts.push("room temperature went outside range");
```
I want to rearrange the code so I can create the new function by using *Extract Function* *(106)* on some existing code. The caller code isn’t quite there yet, but I can get there by using *Extract Variable (119)* a few times. First, I disentangle the call to the old function from the conditional.

<!-- Page 361 -->

*caller…*
```
const low = aRoom.daysTempRange.low;
const high = aRoom.daysTempRange.high;
const isWithinRange = aPlan.withinRange(low, high);
if (!isWithinRange)
alerts.push("room temperature went outside range");
```
I then extract the input parameter.

*caller…*
```
const tempRange = aRoom.daysTempRange;
const low = tempRange.low;
const high = tempRange.high;
const isWithinRange = aPlan.withinRange(low, high);
if (!isWithinRange)
alerts.push("room temperature went outside range");
```
With that done, I can now use *Extract Function (106)* to create the new function.

*caller…*
```
const tempRange = aRoom.daysTempRange;
const isWithinRange = xxNEWwithinRange(aPlan, tempRange);
if (!isWithinRange)
alerts.push("room temperature went outside range");
```
*top level…*
```
function xxNEWwithinRange(aPlan, tempRange) {
const low = tempRange.low;
const high = tempRange.high;
const isWithinRange = aPlan.withinRange(low, high);
return isWithinRange;
}
```

<!-- Page 362 -->

Since the original function is in a different context (the HeatingPlan class), I need to use *Move Function (198)*.

*caller…*
```
const tempRange = aRoom.daysTempRange;
const isWithinRange = aPlan.xxNEWwithinRange(tempRange);
if (!isWithinRange)
alerts.push("room temperature went outside range");
```
*class HeatingPlan…*
```
xxNEWwithinRange(tempRange) {
const low = tempRange.low;
const high = tempRange.high;
const isWithinRange = this.withinRange(low, high);
return isWithinRange;
}
```
I then continue as before, replacing other callers and inlining the old function into the new one. I would also inline the variables I extracted to provide the clean separation for extracting the new function.

Because this variation is entirely composed of refactorings, it’s particularly handy when I have a refactoring tool with robust extract and inline operations.

### REPLACE PARAMETER WITH QUERY

##### formerly: Replace Parameter with Method

inverse of: *Replace Query with Parameter (327)*

<!-- Page 363 -->

#### Motivation

The parameter list to a function should summarize the points of variability of that function, indicating the primary ways in which that function may behave differently. As with any statement in code, it’s good to avoid any duplication, and it’s easier to understand if the parameter list is short.

If a call passes in a value that the function can just as easily determine for itself, that’s a form of duplication—one that unnecessarily complicates the caller which has to determine the value of a parameter when it could be freed from that work.

The limit on this is suggested by the phrase “just as easily.” By removing the parameter, I’m shifting the responsibility for determining the parameter value. When the parameter is present, determining its value is the caller’s responsibility; otherwise, that responsibility shifts to the function body. My usual habit is to simplify life for callers, which implies moving responsibility to the function body—but only if that responsibility is appropriate there.

The most common reason to avoid Replace Parameter with Query is if removing the parameter adds an unwanted dependency to the function body—forcing it to access a program element that I’d rather it remained ignorant of. This may be a new dependency, or an existing one that I’d like to remove. Usually this comes up where I’d need to add a problematic function call to the function body, or access something within a receiver object that I’d prefer to move out later.

The safest case for Replace Parameter with Query is when the value of the parameter I

<!-- Page 364 -->

want to remove is determined merely by querying another parameter in the list. There’s rarely any point in passing two parameters if one can be determined from the other.

One thing to watch out for is if the function I’m looking at has referential transparency —that is, if I can be sure that it will behave the same way whenever it’s called with the same parameter values. Such functions are much easier to reason about and test, and I don’t want to alter them to lose that property. So I wouldn’t replace a parameter with an access to a mutable global variable.

#### Mechanics

If necessary, use *Extract Function (106)* on the calculation of the parameter.

Replace references to the parameter in the function body with references to the expression that yields the parameter. Test after each change.

Use *Change Function Declaration (124)* to remove the parameter.

#### Example

I most often use Replace Parameter with Query when I’ve done some other refactorings that make a parameter no longer needed. Consider this code.

*class Order…*
```
get finalPrice() {
const basePrice = this.quantity * this.itemPrice;
let discountLevel;
if (this.quantity > 100) discountLevel = 2;
else discountLevel = 1;
return this.discountedPrice(basePrice, discountLevel);
}
discountedPrice(basePrice, discountLevel) {
switch (discountLevel) {
case 1: return basePrice * 0.95;
case 2: return basePrice * 0.9;
}
}
```
When I’m simplifying a function, I’m keen to apply *Replace Temp with Query (178)*, which would lead me to

<!-- Page 365 -->

*class Order…*
```
get finalPrice() {
const basePrice = this.quantity * this.itemPrice;
return this.discountedPrice(basePrice, this.discountLevel);
}
get discountLevel() {
return (this.quantity > 100)? 2 : 1;
}
```
Once I’ve done this, there’s no need to pass the result of discountLevel to discountedPrice—it can just as easily make the call itself.

I replace any reference to the parameter with a call to the method instead.

*class Order…*
```
discountedPrice(basePrice, discountLevel) {
switch (this.discountLevel) {
case 1: return basePrice * 0.95;
case 2: return basePrice * 0.9;
}
}
```
I can then use *Change Function Declaration (124)* to remove the parameter.

*class Order…*
```
get finalPrice() {
const basePrice = this.quantity * this.itemPrice;
return this.discountedPrice(basePrice, this.discountLevel);
}
discountedPrice(basePrice, discountLevel) {
switch (this.discountLevel) {
case 1: return basePrice * 0.95;
case 2: return basePrice * 0.9;
}
}
```

<!-- Page 366 -->

### REPLACE QUERY WITH PARAMETER

inverse of: *Replace Parameter with Query (324)*

#### Motivation

When looking through a function’s body, I sometimes see references to something in the function’s scope that I’m not happy with. This might be a reference to a global variable, or to an element in the same module that I intend to move away. To resolve this, I need to replace the internal reference with a parameter, shifting the responsibility of resolving the reference to the caller of the function.

Most of these cases are due to my wish to alter the dependency relationships in the code —to make the target function no longer dependent on the element I want to parameterize. There’s a tension here between converting everything to parameters, which results in long repetitive parameter lists, and sharing a lot of scope which can lead to a lot of coupling between functions. Like most tricky decisions, it’s not something I can reliably get right, so it’s important that I can reliably change things so the program can take advantage of my increasing understanding.

It’s easier to reason about a function that will always give the same result when called with same parameter values—this is called referential transparency. If a function accesses some element in its scope that isn’t referentially transparent, then the

<!-- Page 367 -->

containing function also lacks referential transparency. I can fix that by moving that element to a parameter. Although such a move will shift responsibility to the caller, there is often a lot to be gained by creating clear modules with referential transparency. A common pattern is to have modules consisting of pure functions which are wrapped by logic that handles the I/O and other variable elements of a program. I can use Replace Query with Parameter to purify parts of a program, making those parts easier to test and reason about.

But Replace Query with Parameter isn’t just a bag of benefits. By moving a query to a parameter, I force my caller to figure out how to provide this value. This complicates life for callers of the functions, and my usual bias is to design interfaces that make life easier for their consumers. In the end, it boils down to allocation of responsibility around the program, and that’s a decision that’s neither easy nor immutable—which is why this refactoring (and its inverse) is one that I need to be very familiar with.

#### Mechanics

Use *Extract Variable (119)* on the query code to separate it from the rest of the function body.

Apply *Extract Function (106)* to the body code that isn’t the call to the query.

Give the new function an easily searchable name, for later renaming.

Use *Inline Variable (123)* to get rid of the variable you just created.

Apply *Inline Function (115)* to the original function.

Rename the new function to that of the original.

#### Example

Consider a simple, yet annoying, control system for temperature. It allows the user to select a temperature on a thermostat—but only sets the target temperature within a range determined by a heating plan.

*class HeatingPlan…*
```
get targetTemperature() {
if (thermostat.selectedTemperature > this._max) return this._max;
```

<!-- Page 368 -->

```
else if (thermostat.selectedTemperature < this._min) return this._min;
else return thermostat.selectedTemperature;
}
```

*caller…*
```
if (thePlan.targetTemperature > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature < thermostat.currentTemperature) setToCool();
else setOff();
```

As a user of such a system, I might be annoyed to have my desires overridden by the heating plan rules, but as a programmer I might be more concerned about how the
```
targetTemperature function has a dependency on a global thermostat object. I can
```

break this dependency by moving it to a parameter.

My first step is to use *Extract Variable (119)* on the parameter that I want to have in my function.

*class HeatingPlan…*
```
get targetTemperature() {
const selectedTemperature = thermostat.selectedTemperature;
if (selectedTemperature > this._max) return this._max;
else if (selectedTemperature < this._min) return this._min;
else return selectedTemperature;
}
```

That makes it easy to apply *Extract Function (106)* on the entire body of the function except for the bit that figures out the parameter.

*class HeatingPlan…*
```
get targetTemperature() {
const selectedTemperature = thermostat.selectedTemperature;
return this.xxNEWtargetTemperature(selectedTemperature);
}
```

<!-- Page 369 -->

```
xxNEWtargetTemperature(selectedTemperature) {
if (selectedTemperature > this._max) return this._max;
else if (selectedTemperature < this._min) return this._min;
else return selectedTemperature;
}
```
I then inline the variable I just extracted, which leaves the function as a simple call.

*class HeatingPlan…*
```
get targetTemperature() {
return this.xxNEWtargetTemperature(thermostat.selectedTemperature);
}
```
I can now use *Inline Function (115)* on this method.

*caller…*
```
if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) >
thermostat.currentTemperature)
setToHeat();
else if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) <
thermostat.currentTemperature)
setToCool();
else
setOff();
```
I take advantage of the easily searchable name of the new function to rename it by removing the prefix.

*caller…*
```
if (thePlan.targetTemperature(thermostat.selectedTemperature) >
thermostat.currentTemperature)
setToHeat();
else if (thePlan.targetTemperature(thermostat.selectedTemperature) <
thermostat.currentTemperature)
```

<!-- Page 370 -->

```
setToCool();
else
setOff();
```
*class HeatingPlan…*
```
targetTemperature(selectedTemperature) {
if (selectedTemperature > this._max) return this._max;
else if (selectedTemperature < this._min) return this._min;
else return selectedTemperature;
}
```
As is often the case with this refactoring, the calling code looks more unwieldy than before. Moving a dependency out of a module pushes the responsibility of dealing with that dependency back to the caller. That’s the tradeoff for the reduced coupling.

But removing the coupling to the thermostat object isn’t the only gain I’ve made with this refactoring. The HeatingPlan class is immutable—its fields are set in the constructor with no methods to alter them. (I’ll save you the effort of looking at the whole class; just trust me on this.) Given an immutable heating plan, by moving the thermostat reference out of the function body I’ve also made targetTemperature referentially transparent. Every time I call targetTemperature on the same object, with the same argument, I will get the same result. If all the methods of the heating plan have referential transparency, that makes this class much easier to test and reason about.

A problem with JavaScript’s class model is that it’s impossible to enforce an immutable class—there’s always a way to get at an object’s data. But writing a class to signal and encourage immutability is often good enough. Creating classes that have this characteristic is often a sound strategy and Replace Query with Parameter is a handy tool for doing this.

### REMOVE SETTING METHOD

<!-- Page 371 -->

#### Motivation

Providing a setting method indicates that a field may be changed. If I don’t want that field to change once the object is created, I don’t provide a setting method (and make the field immutable). That way, the field is set only in the constructor, my intention to have it not change is clear, and I usually remove the very possibility that the field will change.

There’s a couple of common cases where this comes up. One is where people always use accessor methods to manipulate a field, even within constructors. This leads to the only call to a setting method being from the constructor. I prefer to remove the setting method to make it clear that updates make no sense after construction.

Another case is where the object is created by clients using creation script rather than by a simple constructor call. Such a creation script starts with the constructor call followed by a sequence of setter method calls to create the new object. Once the script is finished, we don’t expect the new object to change some (or even all) of its fields. The setters are only expected to be called during this initial creation. In this case, I’d get rid of them to make my intentions clearer.

#### Mechanics

If the value that’s being set isn’t provided to the constructor, use *Change Function* *Declaration (124)* to add it. Add a call to the setting method within the constructor.

If you wish to remove several setting methods, add all their values to the constructor at once. This simplifies the later steps.

<!-- Page 372 -->

Remove each call of a setting method outside of the constructor, using the new constructor value instead. Test after each one.

If you can’t replace the call to the setter by creating a new object (because you are updating a shared reference object), abandon the refactoring.

Use *Inline Function (115)* on the setting method. Make the field immutable if possible.

Test.

#### Example

I have a simple person class.

*class Person…*
```
get name() {return this._name;}
set name(arg) {this._name = arg;}
get id() {return this._id;}
set id(arg) {this._id = arg;}
```

At the moment, I create a new object with code like this:
```
const martin = new Person();
martin.name = "martin";
martin.id = "1234";
```

The name of a person may change after it’s created, but the ID does not. To make this clear, I want to remove the setting method for ID.

I still need to set the ID initially, so I’ll use *Change Function Declaration (124)* to add it to the constructor.

*class Person…*
```
constructor(id) {
this.id = id;
}
```

<!-- Page 373 -->

I then adjust the creation script to set the ID via the constructor.
```
const martin = new Person("1234");
martin.name = "martin";
martin.id = "1234";
```
I do this in each place I create a person, testing after each change.

When they are all done, I can apply *Inline Function (115)* to the setting method.

*class Person…*
```
constructor(id) {
this._id = id;
}
get name() {return this._name;}
set name(arg) {this._name = arg;}
get id() {return this._id;}
set id(arg) {this._id = arg;}
```
### REPLACE CONSTRUCTOR WITH FACTORY FUNCTION

formerly: *Replace Constructor with Factory Method*

#### Motivation

Many objectoriented languages have a special constructor function that’s called to

<!-- Page 374 -->

initialize an object. Clients typically call this constructor when they want to create a new object. But these constructors often come with awkward limitations that aren’t there for more general functions. A Java constructor must return an instance of the class it was called with, which means I can’t replace it with a subclass or proxy depending on the environment or parameters. Constructor naming is fixed, which makes it impossible for me to use a name that is clearer than the default. Constructors often require a special operator to invoke (“new” in many languages) which makes them difficult to use in contexts that expect normal functions.

A factory function suffers from no such limitations. It will likely call the constructor as part of its implementation, but I can freely substitute something else.

#### Mechanics

Create a factory function, its body being a call to the constructor.

Replace each call to the constructor with a call to the factory function.

Test after each change.

Limit the constructor’s visibility as much as possible.

#### Example

A quick but wearisome example uses kinds of employees. Consider an employee class:

*class Employee…*
```
constructor (name, typeCode) {
this._name = name;
this._typeCode = typeCode;
}
get name() {return this._name;}
get type() {
return Employee.legalTypeCodes[this._typeCode];
}
static get legalTypeCodes() {
return {"E": "Engineer", "M": "Manager", "S": "Salesman"};
}
```

This is used from

<!-- Page 375 -->

*caller…*
```
candidate = new Employee(document.name, document.empType);
```

and

*caller…*
```
const leadEngineer = new Employee(document.leadEngineer, 'E');
```

My first step is to create the factory function. Its body is a simple delegation to the constructor.

*top level…*
```
function createEmployee(name, typeCode) {
return new Employee(name, typeCode);
}
```

I then find the callers of the constructor and change them, one at a time, to use the factory function instead.

The first one is obvious:

*caller…*
```
candidate = createEmployee(document.name, document.empType);
```

With the second case, I could use the new factory function like this:

*caller…*

<!-- Page 376 -->

```
const leadEngineer = createEmployee(document.leadEngineer,'E');
```
But I don’t like using the type code here—it’s generally a bad smell to pass a code as a literal string. So I prefer to create a new factory function that embeds the kind of employee I want into its name.

*caller…*
```
const leadEngineer = createEngineer(document.leadEngineer);
```
*top level…*
```
function createEngineer(name) {
return new Employee(name,'E');
}
```
### REPLACE FUNCTION WITH COMMAND

formerly: *Replace Method with Method Object*

inverse of: *Replace Command with Function (344)*

<!-- Page 377 -->

#### Motivation

Functions—either freestanding or attached to objects as methods—are one of the fundamental building blocks of programming. But there are times when it’s useful to encapsulate a function into its own object, which I refer to as a “command object” or simply a command. Such an object is mostly built around a single method, whose request and execution is the purpose of the object.

A command offers a greater flexibility for the control and expression of a function than the plain function mechanism. Commands can have complimentary operations, such as undo. I can provide methods to build up their parameters to support a richer lifecycle. I can build in customizations using inheritance and hooks. If I’m working in a language with objects but without firstclass functions, I can provide much of that capability by using commands instead. Similarly, I can use methods and fields to help break down a complex function, even in a language that lacks nested functions, and I can call those methods directly while testing and debugging.

All these are good reasons to use commands, and I need to be ready to refactor

<!-- Page 378 -->

functions into commands when I need to. But we must not forget that this flexibility, as ever, comes at a price paid in complexity. So, given the choice between a firstclass function and a command, I’ll pick the function 95% of the time. I only use a command when I specifically need a facility that simpler approaches can’t provide.

Like many words in software development, “command” is rather overloaded. In the context I’m using it here, it is an object that encapsulates a request, following the command pattern in Design Patterns [gof]. When I use “command” in this sense, I use “command object” to set the context, and “command” afterwards. The word “command” is also used in the commandquery separation principle [mfcqs], where a command is an object method that changes observable state. I’ve always tried to avoid using command in that sense, preferring “modifier” or “mutator.”

#### Mechanics

Create an empty class for the function. Name it based on the function.

Use *Move Function (198)* to move the function to the empty class.

Keep the original function as a forwarding function until at least the end of the refactoring.

Follow any convention the language has for naming commands. If there is no convention, choose a generic name for the command’s execute function, such as “execute” or “call”.

Consider making a field for each argument, and move these arguments to the constructor.

#### Example

The JavaScript language has many faults, but one of its great decisions was to make functions firstclass entities. I thus don’t have to go through all the hoops of creating commands for common tasks that I need to do in languages without this facility. But there are still times when a command is the right tool for the job.

One of these cases is breaking up a complex function so I can better understand and modify it. To really show the value of this refactoring, I need a long and complicated function—but that would take too long to write, let alone for you to read. Instead, I’ll go with a function that’s short enough not to need it. This one scores points for an insurance application:

<!-- Page 379 -->

```
function score(candidate, medicalExam, scoringGuide) {
let result = 0;
let healthLevel = 0;
let highMedicalRiskFlag = false;
if (medicalExam.isSmoker) {
healthLevel += 10;
highMedicalRiskFlag = true;
}
let certificationGrade = "regular";
if (scoringGuide.stateWithLowCertification(candidate.originState)) {
certificationGrade = "low";
result = 5;
}
// lots more code like this
result = Math.max(healthLevel 5, 0);
return result;
}
```
I begin by creating an empty class and then *Move Function (198)* to move the function into it.
```
function score(candidate, medicalExam, scoringGuide) {
return new Scorer().execute(candidate, medicalExam, scoringGuide);
}
class Scorer {
execute (candidate, medicalExam, scoringGuide) {
let result = 0;
let healthLevel = 0;
let highMedicalRiskFlag = false;
if (medicalExam.isSmoker) {
healthLevel += 10;
highMedicalRiskFlag = true;
}
let certificationGrade = "regular";
if (scoringGuide.stateWithLowCertification(candidate.originState)) {
certificationGrade = "low";
result = 5;
}
// lots more code like this
result = Math.max(healthLevel 5, 0);
return result;
}
}
```

<!-- Page 380 -->

Most of the time, I prefer to pass arguments to a command on the constructor and have the execute method take no parameters. While this matters less for a simple decomposition scenario like this, it’s very handy when I want to manipulate the command with a more complicated parameter setting lifecycle or customizations. Different command classes can have different parameters but be mixed together when queued for execution.

I can do these parameters one at a time.
```
function score(candidate, medicalExam, scoringGuide) {
return new Scorer(candidate).execute(candidate, medicalExam, scoringGuide);
}
```
*class Scorer…*
```
constructor(candidate){
this._candidate = candidate;
}
execute (candidate, medicalExam, scoringGuide) {
let result = 0;
let healthLevel = 0;
let highMedicalRiskFlag = false;
if (medicalExam.isSmoker) {
healthLevel += 10;
highMedicalRiskFlag = true;
}
let certificationGrade = "regular";
if (scoringGuide.stateWithLowCertification(this._candidate.originState)) {
certificationGrade = "low";
result = 5;
}
// lots more code like this
result = Math.max(healthLevel 5, 0);
return result;
}
```
##### I continue with the other parameters

<!-- Page 381 -->

```
function score(candidate, medicalExam, scoringGuide) {
return new Scorer(candidate, medicalExam, scoringGuide).execute();
}
```
*class Scorer…*
```
constructor(candidate, medicalExam, scoringGuide){
this._candidate = candidate;
this._medicalExam = medicalExam;
this._scoringGuide = scoringGuide;
}
execute () {
let result = 0;
let healthLevel = 0;
let highMedicalRiskFlag = false;
if (this._medicalExam.isSmoker) {
healthLevel += 10;
highMedicalRiskFlag = true;
}
let certificationGrade = "regular";
if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
certificationGrade = "low";
result = 5;
}
// lots more code like this
result = Math.max(healthLevel 5, 0);
return result;
}
```
That completes Replace Function with Command, but the whole point of doing this refactoring is to allow me to break down the complicated functions—so let me outline some steps to achieve that. My next move here is to change all the local variables into fields. Again, I do these one at a time.

*class Scorer…*
```
constructor(candidate, medicalExam, scoringGuide){
```

<!-- Page 382 -->

```
this._candidate = candidate;
this._medicalExam = medicalExam;
this._scoringGuide = scoringGuide;
}
execute () {
this._result = 0;
let healthLevel = 0;
let highMedicalRiskFlag = false;
if (this._medicalExam.isSmoker) {
healthLevel += 10;
highMedicalRiskFlag = true;
}
let certificationGrade = "regular";
if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
certificationGrade = "low";
this._result = 5;
}
// lots more code like this
this._result = Math.max(healthLevel 5, 0);
return this._result;
}
```
I repeat this for all the local variables. (This is one of those refactorings that I felt was sufficiently simple that I haven’t given it an entry in the catalog. I feel slightly guilty about this.)

*class Scorer…*
```
constructor(candidate, medicalExam, scoringGuide){
this._candidate = candidate;
this._medicalExam = medicalExam;
this._scoringGuide = scoringGuide;
}
execute () {
this._result = 0;
this._healthLevel = 0;
this._highMedicalRiskFlag = false;
if (this._medicalExam.isSmoker) {
this._healthLevel += 10;
this._highMedicalRiskFlag = true;
}
this._certificationGrade = "regular";
if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
```

<!-- Page 383 -->

```
this._certificationGrade = "low";
this._result = 5;
}
// lots more code like this
this._result = Math.max(this._healthLevel 5, 0);
return this._result;
}
```
Now I’ve moved all the function’s state to the command object, I can use refactorings like *Extract Function (106)* without getting tangled up in all the variables and their scopes.

*class Scorer…*
```
execute () {
this._result = 0;
this._healthLevel = 0;
this._highMedicalRiskFlag = false;
this.scoreSmoking();
this._certificationGrade = "regular";
if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
this._certificationGrade = "low";
this._result = 5;
}
// lots more code like this
this._result = Math.max(this._healthLevel 5, 0);
return this._result;
}
scoreSmoking() {
if (this._medicalExam.isSmoker) {
this._healthLevel += 10;
this._highMedicalRiskFlag = true;
}
}
```
This allows me to treat the command similarly to how I’d deal with a nested function. Indeed, when doing this refactoring in JavaScript, using nested functions would be a reasonable alternative to using a command. I’d still use a command for this, partly because I’m more familiar with commands and partly because with a command I can write tests and debugging calls against the subfunctions.

### REPLACE COMMAND WITH FUNCTION

<!-- Page 384 -->

inverse of: *Replace Function with Command (337)*

#### Motivation

Command objects provide a powerful mechanism for handling complex computations. They can easily be broken down into separate methods sharing common state through the fields; they can be invoked via different methods for different effects; they can have their data built up in stages. But that power comes at a cost. Most of the time, I just want to invoke a function and have it do its thing. If that’s the case, and the function isn’t too complex, then a command object is more trouble than its worth and should be turned into a regular function.

#### Mechanics

Apply *Extract Function (106)* to the creation of the command and the call to the command’s execution method.

This creates the new function that will replace the command in due course.

For each method called by the command’s execution method, apply *Inline Function* *(115)*.

<!-- Page 385 -->

If the supporting function returns a value, use *Extract Variable (119)* on the call first and then *Inline Function (115)*.

Use *Change Function Declaration (124)* to put all the parameters of the constructor into the command’s execution method instead.

For each field, alter the references in the command’s execution method to use the parameter instead. Test after each change.

Inline the constructor call and command’s execution method call into the caller (which is the replacement function).

Test.

Apply *Remove Dead Code (237)* to the command class.

#### Example

I’ll begin with this small command object:
```
class ChargeCalculator {
constructor (customer, usage, provider){
this._customer = customer;
this._usage = usage;
this._provider = provider;
}
get baseCharge() {
return this._customer.baseRate * this._usage;
}
get charge() {
return this.baseCharge + this._provider.connectionCharge;
}
}
```
It is used by code like this:

*caller…*
```
monthCharge = new ChargeCalculator(customer, usage, provider).charge;
```

<!-- Page 386 -->

The command class is small and simple enough to be better off as a function.

I begin by using *Extract Function (106)* to wrap the class creation and invocation.

*caller…*
```
monthCharge = charge(customer, usage, provider);
```
*top level…*
```
function charge(customer, usage, provider) {
return new ChargeCalculator(customer, usage, provider).charge;
}
```
I have to decide how to deal with any supporting functions, in this case baseCharge. My usual approach for a function that returns a value is to first *Extract Variable (119)* on that value.

*class ChargeCalculator…*
```
get baseCharge() {
return this._customer.baseRate * this._usage;
}
get charge() {
const baseCharge = this.baseCharge;
return baseCharge + this._provider.connectionCharge;
}
```
Then, I use *Inline Function (115)* on the supporting function.

*class ChargeCalculator…*
```
get charge() {
const baseCharge = this._customer.baseRate * this._usage;
return baseCharge + this._provider.connectionCharge;
```

<!-- Page 387 -->

}

I now have all the processing in a single function, so my next step is to move the data passed to the constructor to the main method. I first use *Change Function Declaration* *(124)* to add all the constructor parameters to the charge method.

*class ChargeCalculator…*
```
constructor (customer, usage, provider){
this._customer = customer;
this._usage = usage;
this._provider = provider;
}
charge(customer, usage, provider) {
const baseCharge = this._customer.baseRate * this._usage;
return baseCharge + this._provider.connectionCharge;
}
```
*top level…*
```
function charge(customer, usage, provider) {
return new ChargeCalculator(customer, usage, provider)
.charge(customer, usage, provider);
}
```
Now I can alter the body of charge to use the passed parameters instead. I can do this one at a time.

*class ChargeCalculator…*
```
constructor (customer, usage, provider){
this._customer = customer;
this._usage = usage;
this._provider = provider;
}
charge(customer, usage, provider) {
const baseCharge = customer.baseRate * this._usage;
```

<!-- Page 388 -->

```
return baseCharge + this._provider.connectionCharge;
}
```
I don’t have to remove the assignment to this._customer in the constructor, as it will just be ignored. But I prefer to do it since that will make a test fail if I miss changing a use of field to the parameter. (And if a test doesn’t fail, I should consider adding a new test.)

I repeat this for the other parameters, ending up with

*class ChargeCalculator…*
```
charge(customer, usage, provider) {
const baseCharge = customer.baseRate * usage;
return baseCharge + provider.connectionCharge;
}
```
Once I’ve done all of these, I can inline into the toplevel charge function. This is a special kind of *Inline Function (115)*, as it’s inlining both the constructor and method call together.

*top level…*
```
function charge(customer, usage, provider) {
const baseCharge = customer.baseRate * usage;
return baseCharge + provider.connectionCharge;
}
```
The command class is now dead code, so I’ll use *Remove Dead Code (237)* to give it an honorable burial.
