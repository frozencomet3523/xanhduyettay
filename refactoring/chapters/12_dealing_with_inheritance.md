# Chapter 12: Dealing with Inheritance

> **Pages:** 389 – 453
> **Summary:** Pull Up Method, Pull Up Field, Pull Up Constructor Body, Push Down Method, Push Down Field, Replace Type Code with Subclasses, Remove Subclass, Extract Superclass, Collapse Hierarchy, Replace Subclass with Delegate, Replace Superclass with Delegate.

---

## Chapter 12 Dealing with Inheritance

In this final chapter, I’ll turn to one of the best known features of objectoriented programming: inheritance. Like any powerful mechanism, it is both very useful and easy to misuse, and it’s often hard to see the misuse until it’s in the rearview mirror. Often, features need to move up or down the inheritance hierarchy. Several refactorings deal with that: *Pull Up Method (350)*, *Pull Up Field (353)*, *Pull Up Constructor Body* *(355)*, *Push Down Method (359)*, and *Push Down Field (361)*. I can add and remove classes from the hierarchy with *Extract Superclass (375)*, *Remove Subclass (369)*, and *Collapse Hierarchy (380)*. I may want to add a subclass to replace a field that I’m using to trigger different behavior based on its value; I do this with *Replace Type Code with* *Subclasses (362)*. Inheritance is a powerful tool, but sometimes it gets used in the wrong place—or the place it’s used in becomes wrong. In that case, I use *Replace Subclass with Delegate* *(381)* or *Replace Superclass with Delegate (399)* to turn inheritance into delegation.

### PULL UP METHOD

##### inverse of: Push Down Method (359)

<!-- Page 390 -->

#### Motivation

Eliminating duplicate code is important. Two duplicate methods may work fine as they are, but they are nothing but a breeding ground for bugs in the future. Whenever there is duplication, there is risk that an alteration to one copy will not be made to the other. Usually, it is difficult to find the duplicates.

The easiest case of using Pull Up Method is when the methods have the same body, implying there’s been a copy and paste. Of course it’s not always as obvious as that. I could just do the refactoring and see if the tests croak—but that puts a lot of reliance on my tests. I usually find it valuable to look for the differences—often, they show up behavior that I forgot to test for.

Often, Pull Up Method comes after other steps. I see two methods in different classes that can be parameterized in such a way that they end up as essentially the same method. In that case, the smallest step is for me to apply *Parameterize Function (310)* separately and then Pull Up Method.

<!-- Page 391 -->

The most awkward complication with Pull Up Method is if the body of the method refers to features that are on the subclass but not on the superclass. When that happens, I need to use *Pul*l *Up Field (353)* and Pull Up Method on those elements first.

If I have two methods with a similar overall flow, but differing in details, I’ll consider the Form Template Method [mfft].

#### Mechanics

Inspect methods to ensure they are identical.

If they do the same thing, but are not identical, refactor them until they have identical bodies.

Check that all method calls and field references inside the method body refer to features that can be called from the superclass.

If the methods have different signatures, use *Change Function Declaration (124)* to get them to the one you want to use on the superclass.

Create a new method in the superclass. Copy the body of one of the methods over to it.

Run static checks.

Delete one subclass method.

Test.

Keep deleting subclass methods until they are all gone.

#### Example

I have two subclass methods that do the same thing.

*class Employee extends Party…*
```
get annualCost() {
return this.monthlyCost * 12;
}
```

<!-- Page 392 -->

##### class Department extends Party…
```
get totalAnnualCost() {
return this.monthlyCost * 12;
}
```
I look at both classes and see that they refer to the monthlyCost property which isn’t defined on the superclass, but is present in both subclasses. Since I’m in a dynamic language, I’m OK; if I were in a static language, I’d need to define an abstract method on Party.

The methods have different names, so I *Change Function Declaration (124)* to make them the same.

*class Department…*
```
get annualCost() {
return this.monthlyCost * 12;
}
```
I copy the method from one subclass and paste it into the superclass.

*class Party…*
```
get annualCost() {
return this.monthlyCost * 12;
}
```
In a static language, I’d compile to ensure that all the references were OK. That won’t help me here, so I first remove annualCost from Employee, test, and then remove it from Department.

That completes the refactoring, but does leave a question. annualCost calls monthlyCost, but monthlyCost doesn’t appear in the Party class. It all works, because JavaScript is a dynamic language—but there is value in signaling that

<!-- Page 393 -->

subclasses of Party should provide an implementation for monthlyCost, particularly if more subclasses get added later on. A good way to provide this signal is a trap method like this:

*class Party…*
```
get monthlyCost() {
throw new SubclassResponsibilityError();
}
```
I call such an error a subclass responsibility error as that was the name used in Smalltalk.

### PULL UP FIELD

inverse of: *Push Down Field (361)*

#### Motivation

<!-- Page 394 -->

If subclasses are developed independently, or combined through refactoring, I often find that they duplicate features. In particular, certain fields can be duplicates. Such fields sometimes have similar names—but not always. The only way I can tell what is going on is by looking at the fields and examining how they are used. If they are being used in a similar way, I can pull them up into the superclass.

By doing this, I reduce duplication in two ways. I remove the duplicate data declaration and I can then move behavior that uses the field from the subclasses to the superclass.

Many dynamic languages do not define fields as part of their class definition—instead, fields appear when they are first assigned to. In this case, pulling up a field is essentially a consequence of *Pu*ll *Up Constructor Body (355)*.

#### Mechanics

Inspect all users of the candidate field to ensure they are used in the same way.

If the fields have different names, use *Rename Field (244)* to give them the same name.

Create a new field in the superclass.

The new field will need to be accessible to subclasses (protected in common languages).

##### Delete the subclass fields.

Test.

### PULL UP CONSTRUCTOR BODY

<!-- Page 395 -->

#### Motivation

Constructors are tricky things. They aren’t quite normal methods—so I’m more restricted in what I can do with them.

If I see subclass methods with common behavior, my first thought is to use *Extract* *Function (106)* followed by *Pull Up Method (350)*, which will move it nicely into the superclass. Constructors tangle that—because they have special rules about what can be done in what order, so I need a slightly different approach.

<!-- Page 396 -->

If this refactoring starts getting messy, I reach for *Replace Constructor with Factory* *Function (334)*.

#### Mechanics

Define a superclass constructor, if one doesn’t already exist. Ensure it’s called by subclass constructors.

Use *Slide Statements (223)* to move any common statements to just after the super call.

Remove the common code from each subclass and put it in the superclass. Add to the super call any constructor parameters referenced in the common code.

Test.

If there is any common code that cannot move to the start of the constructor, use *Extract Function (106)* followed by *Pull Up Method (350)*.

#### Example

##### I start with the following code:
```
class Party {}
class Employee extends Party {
constructor(name, id, monthlyCost) {
super();
this._id = id;
this._name = name;
this._monthlyCost = monthlyCost;
}
// rest of class...
class Department extends Party {
constructor(name, staff){
super();
this._name = name;
this._staff = staff;
}
// rest of class...
```
The common code here is the assignment of the name. I use *Slide Statements (223)* to

<!-- Page 397 -->

move the assignment in Employee next to the call to super():
```
class Employee extends Party {
constructor(name, id, monthlyCost) {
super();
this._name = name;
this._id = id;
this._monthlyCost = monthlyCost;
}
// rest of class...
```
With that tested, I move the common code to the superclass. Since that code contains a reference to a constructor argument, I pass that in as a parameter.

*class Party…*

```
constructor(name){
this._name = name;
}
```
*class Employee…*
```
constructor(name, id, monthlyCost) {
super(name);
this._id = id;
this._monthlyCost = monthlyCost;
}
```
*class Department…*

```
constructor(name, staff){
super(name);
this._staff = staff;
}
```
##### Run the tests, and I’m done.

Most of the time, constructor behavior will work like this: Do the common elements first (with a super call), then do extra work that the subclass needs. Occasionally,

<!-- Page 398 -->

however, there is some common behavior later.

Consider this example:

*class Employee…*
```
constructor (name) {...}
get isPrivileged() {...}
assignCar() {...}
```

*class Manager extends Employee…*
```
constructor(name, grade) {
super(name);
this._grade = grade;
if (this.isPrivileged) this.assignCar(); // every subclass does this
}
get isPrivileged() {
return this._grade > 4;
}
```

The wrinkle here comes from the fact that the call to isPrivileged can’t be made until after the grade field is assigned, and that can only be done in the subclass.

In this case, I do *Extract Function (106)* on the common code:

*class Manager…*
```
constructor(name, grade) {
super(name);
this._grade = grade;
this.finishConstruction();
}
finishConstruction() {
if (this.isPrivileged) this.assignCar();
}
```

<!-- Page 399 -->

Then, I use *Pul*l *Up Method (350)* to move it to the superclass.

*class Employee…*
```
finishConstruction() {
if (this.isPrivileged) this.assignCar();
}
```
### PUSH DOWN METHOD

inverse of: *Pul*l *Up Method (350)*

#### Motivation

If a method is only relevant to one subclass (or a small proportion of subclasses), removing it from the superclass and putting it only on the subclass(es) makes that clearer. I can only do this refactoring if the caller knows it’s working with a particular subclass—otherwise, I should use *Replace Conditional with Polymorphism (272)* with some placebo behavior on the superclass.

#### Mechanics

<!-- Page 400 -->

Copy the method into every subclass that needs it.

Remove the method from the superclass.

Test.

Remove the method from each superclass that doesn’t need it.

Test.

### PUSH DOWN FIELD

inverse of: *Pul*l *Up Field (353)*

#### Motivation

If a field is only used by one subclass (or a small proportion of subclasses), I move it to those subclasses.

#### Mechanics

<!-- Page 401 -->

Declare field in all subclasses that need it.

Remove the field from the superclass.

Test.

Remove the field from all subclasses that don’t need it.

Test.

### REPLACE TYPE CODE WITH SUBCLASSES

subsumes: *Replace Type Code with State/Strategy*

subsumes: *Extract Subclass*

inverse of: *Remove Subclass (369)*

#### Motivation

Software systems often need to represent different kinds of a similar thing. I may classify employees by their job type (engineer, manager, salesman), or orders by their priority (rush, regular). My first tool for handling this is some kind of type code field—

<!-- Page 402 -->

depending on the language, that might be an enum, symbol, string, or number. Often, this type code will come from an external service that provides me with the data I’m working on.

Most of the time, such a type code is all I need. But there are a couple of situations where I could do with something more, and that something more are subclasses. There are two things that are particularly enticing about subclasses. First, they allow me to use polymorphism to handle conditional logic. I find this most helpful when I have several functions that invoke different behavior depending on the value of the type code. With subclasses, I can apply *Replace Conditional with Polymorphism (272)* to these functions.

The second case is where I have fields or methods that are only valid for particular values of a type code, such as a sales quota that’s only applicable to the “salesman” type code. I can then create the subclass and apply *Push Down Field (361)*. While I can include validation logic to ensure a field is only used when the type code has the correct value, using a subclass makes the relationship more explicit.

When using Replace Type Code with Subclasses, I need to consider whether to apply it directly to the class I’m looking at, or to the type code itself. Do I make engineer a subtype of employee, or should I give the employee an employee type property which can have subtypes for engineer and manager? Using direct subclassing is simpler, but I can’t use it for the job type if I need it for something else. I also can’t use direct subclasses if the type is mutable. If I need to move the subclasses to an employee type property, I can do that by using *Replace Primitive with Object (174)* on the type code to create an employee type class and then using Replace Type Code with Subclasses on that new class.

#### Mechanics

##### Selfencapsulate the type code field.

Pick one type code value. Create a subclass for that type code. Override the type code getter to return the literal type code value.

Create selector logic to map from the type code parameter to the new subclass.

With direct inheritance, use *Replace Constructor with Factory Function (334)* and put the selector logic in the factory. With indirect inheritance, the selector logic may stay in the constructor.

<!-- Page 403 -->

Test.

Repeat creating the subclass and adding to the selector logic for each type code value. Test after each change.

Remove the type code field.

Test.

Use *Push Down Method (359)* and *Replace Conditional with Polymorphism (272)* on any methods that use the type code accessors. Once all are replaced, you can remove the type code accessors.

#### Example

I’ll start with this overused employee example:

*class Employee…*
```
constructor(name, type){
this.validateType(type);
this._name = name;
this._type = type;
}
validateType(arg) {
if (!["engineer", "manager", "salesman"].includes(arg))
throw new Error(`Employee cannot be of type ${arg}`);
}
toString() {return `${this._name} (${this._type})`;}
```
My first step is to use *Encapsulate Variable (132)* to selfencapsulate the type code.

*class Employee…*
```
get type() {return this._type;}
toString() {return `${this._name} (${this.type})`;}
```
*Note that* toString *uses the new getter by removing the underscore.*

I pick one type code, the engineer, to start with. I use direct inheritance, subclassing the

<!-- Page 404 -->

employee class itself. The employee subclass is simple—just overriding the type code getter with the appropriate literal value.
```
class Engineer extends Employee {
get type() {return "engineer";}
}
```

Although JavaScript constructors can return other objects, things will get messy if I try to put selector logic in there, since that logic gets intertwined with field initialization. So I use *Replace Constructor with Factory Function (334)* to create a new space for it.
```
function createEmployee(name, type) {
return new Employee(name, type);
}
```

To use the new subclass, I add selector logic into the factory.
```
function createEmployee(name, type) {
switch (type) {
case "engineer": return new Engineer(name, type);
}
return new Employee(name, type);
}
```

I test to ensure that worked out correctly. But, because I’m paranoid, I then alter the return value of the engineer’s override and test again to ensure the test fails. That way I know the subclass is being used. I correct the return value and continue with the other cases. I can do them one at a time, testing after each change.
```
class Salesman extends Employee {
get type() {return "salesman";}
}
class Manager extends Employee {
get type() {return "manager";}
```

<!-- Page 405 -->

```
}
function createEmployee(name, type) {
switch (type) {
case "engineer": return new Engineer(name, type);
case "salesman": return new Salesman(name, type);
case "manager": return new Manager (name, type);
}
return new Employee(name, type);
}
```
Once I’m done with them all, I can remove the type code field and the superclass getting method (the ones in the subclasses remain).

*class Employee…*
```
constructor(name, type){
this.validateType(type);
this._name = name;
this._type = type;
}
get type() {return this._type;}
toString() {return `${this._name} (${this.type})`;}
```
After testing to ensure all is still well, I can remove the validation logic, since the switch is effectively doing the same thing.

*class Employee…*
```
constructor(name, type){
this.validateType(type);
this._name = name;
}
function createEmployee(name, type) {
switch (type) {
case "engineer": return new Engineer(name, type);
case "salesman": return new Salesman(name, type);
case "manager": return new Manager (name, type);
default: throw new Error(`Employee cannot be of type ${type}`);
}
return new Employee(name, type);
```

<!-- Page 406 -->

}

The type argument to the constructor is now useless, so it falls victim to *Change* *Function Declaration (124)*.

*class Employee…*
```
constructor(name, type){
this._name = name;
}
function createEmployee(name, type) {
switch (type) {
case "engineer": return new Engineer(name, type);
case "salesman": return new Salesman(name, type);
case "manager": return new Manager (name, type);
default: throw new Error(`Employee cannot be of type ${type}`);
}
}
```
I still have the type code accessors on the subclasses—get type. I’ll usually want to remove these too, but that may take a bit of time due to other methods that depend on them. I’ll use *Replace Conditional with Polymorphism (272)* and *Push Down Method* *(359)* to deal with these. At some point, I’ll have no code that uses the type getters, so I will subject them to the tender mercies of *Remove Dead Code (237)*.

#### Example: Using Indirect Inheritance

Let’s go back to the starting case—but this time, I already have existing subclasses for parttime and fulltime employees, so I can’t subclass from Employee for the type codes. Another reason to not use direct inheritance is keeping the ability to change the type of employee.

*class Employee…*
```
constructor(name, type){
this.validateType(type);
this._name = name;
this._type = type;
}
```

<!-- Page 407 -->

```
validateType(arg) {
if (!["engineer", "manager", "salesman"].includes(arg))
throw new Error(`Employee cannot be of type ${arg}`);
}
get type() {return this._type;}
set type(arg) {this._type = arg;}
get capitalizedType() {
return this._type.charAt(0).toUpperCase() + this._type.substr(1).toLowerCase();
}
toString() {
return `${this._name} (${this.capitalizedType})`;
}
```
This time toString is a bit more complicated, to allow me to illustrate something shortly.

My first step is to use *Replace Primitive with Object (174)* on the type code.
```
class EmployeeType {
constructor(aString) {
this._value = aString;
}
toString() {return this._value;}
}
```
*class Employee…*
```
constructor(name, type){
this.validateType(type);
this._name = name;
this.type = type;
}
validateType(arg) {
if (!["engineer", "manager", "salesman"].includes(arg))
throw new Error(`Employee cannot be of type ${arg}`);
}
get typeString() {return this._type.toString();}
get type() {return this._type;}
set type(arg) {this._type = new EmployeeType(arg);}
get capitalizedType() {
return this.typeString.charAt(0).toUpperCase()
```

<!-- Page 408 -->

```
+ this.typeString.substr(1).toLowerCase();
}
toString() {
return `${this._name} (${this.capitalizedType})`;
}
```
I then apply the usual mechanics of Replace Type Code with Subclasses to the employee type.

*class Employee…*
```
set type(arg) {this._type = Employee.createEmployeeType(arg);}
static createEmployeeType(aString) {
switch(aString) {
case "engineer": return new Engineer();
case "manager": return new Manager ();
case "salesman": return new Salesman();
default: throw new Error(`Employee cannot be of type ${aString}`);
}
}
class EmployeeType {
}
class Engineer extends EmployeeType {
toString() {return "engineer";}
}
class Manager extends EmployeeType {
toString() {return "manager";}
}
class Salesman extends EmployeeType {
toString() {return "salesman";}
}
```
If I were leaving it at that, I could remove the empty EmployeeType. But I prefer to leave it there as it makes explicit the relationship between the various subclasses. It’s also a handy spot for moving other behavior there, such as the capitalization logic I tossed into the example specifically to illustrate this point.

*class Employee…*
```
toString() {
```

<!-- Page 409 -->

```
return `${this._name} (${this.type.capitalizedName})`;
}
```
*class EmployeeType…*
```
get capitalizedName() {
return this.toString().charAt(0).toUpperCase()
+ this.toString().substr(1).toLowerCase();
}
```
For those familiar with the first edition of the book, this example essentially supersedes the Replace Type Code with State/Strategy. I now think of that refactoring as Replace Type Code with Subclasses using indirect inheritance, so didn’t consider it worth its own entry in the catalog. (I never liked the name anyway.)

### REMOVE SUBCLASS

formerly: *Replace Subclass with Fields*

inverse of: *Replace Type Code with Subclasses (362)*

<!-- Page 410 -->

#### Motivation

Subclasses are useful. They support variations in data structure and polymorphic behavior. They are a good way to program by difference. But as a software system evolves, subclasses can lose their value as the variations they support are moved to other places or removed altogether. Sometimes, subclasses are added in anticipation of features that never end up being built, or end up being built in a way that doesn’t need the subclasses.

A subclass that does too little incurs a cost in understanding that is no longer worthwhile. When that time comes, it’s best to remove the subclass, replacing it with a field on its superclass.

#### Mechanics

Use *Replace Constructor with Factory Function (334)* on the subclass constructor.

If the clients of the constructors use a data field to decide which subclass to create, put that decision logic into a superclass factory method.

If any code tests against the subclass’s types, use *Extract Function (106)* on the type

<!-- Page 411 -->

test and *Move Function (198)* to move it to the superclass. Test after each change.

Create a field to represent the subclass type.

Change the methods that refer to the subclass to use the new type field.

##### Delete the subclass.

Test.

Often, this refactoring is used on a group of subclasses at once—in which case carry out the steps to encapsulate them (add factory function, move type tests) first, then individually fold them into the superclass.

#### Example

I’ll start with this stump of subclasses:

*class Person…*
```
constructor(name) {
this._name = name;
}
get name() {return this._name;}
get genderCode() {return "X";}
// snip
class Male extends Person {
get genderCode() {return "M";}
}
class Female extends Person {
get genderCode() {return "F";}
}
```
If that’s all that a subclass does, it’s not really worth having. But before I remove these subclasses, it’s usually worth checking to see if there’s any subclassdependent behavior in the clients that should be moved in there. In this case, I don’t find anything worth keeping the subclasses for.

*client…*

<!-- Page 412 -->

```
const numberOfMales = people.filter(p => p instanceof Male).length;
```

Whenever I want to change how I represent something, I try to first encapsulate the current representation to minimize the impact on any client code. When it comes to creating subclasses, the way to encapsulate is to use *Replace Constructor with Factory* *Function (334)*. In this case, there’s a couple of ways I could make the factory.

The most direct way is to create a factory method for each constructor.
```
function createPerson(name) {
return new Person(name);
}
function createMale(name) {
return new Male(name);
}
function createFemale(name) {
return new Female(name);
}
```

But although that’s the direct choice, objects like this are often loaded from a source that uses the gender codes directly.
```
function loadFromInput(data) {
const result = [];
data.forEach(aRecord => {
let p;
switch (aRecord.gender) {
case 'M': p = new Male(aRecord.name); break;
case 'F': p = new Female(aRecord.name); break;
default: p = new Person(aRecord.name);
}
result.push(p);
});
return result;
}
```

In that case, I find it better to use *Extract Function (106)* on the selection logic for which class to create, and make that the factory function.

<!-- Page 413 -->

```
function createPerson(aRecord) {
let p;
switch (aRecord.gender) {
case'M': p = new Male(aRecord.name); break;
case'F': p = new Female(aRecord.name); break;
default: p = new Person(aRecord.name);
}
return p;
}
function loadFromInput(data) {
const result = [];
data.forEach(aRecord => {
result.push(createPerson(aRecord));
});
return result;
}
```
While I’m there, I’ll clean up those two functions. I’ll use *Inline Variable (123)* on createPerson:
```
function createPerson(aRecord) {
switch (aRecord.gender) {
case'M': return new Male (aRecord.name);
case'F': return new Female(aRecord.name);
default: return new Person(aRecord.name);
}
}
```
and *Replace Loop with Pipeline (231)* on loadFromInput:
```
function loadFromInput(data) {
return data.map(aRecord => createPerson(aRecord));
}
```
The factory encapsulates the creation of the subclasses, but there is also the use of instanceof—which never smells good. I use *Extract Function (106)* on the type check.

*client…*

<!-- Page 414 -->

```
const numberOfMales = people.filter(p => isMale(p)).length;
function isMale(aPerson) {return aPerson instanceof Male;}
```
Then I use *Move Function (198)* to move it into Person.

*class Person…*
```
get isMale() {return this instanceof Male;}
```
*client…*
```
const numberOfMales = people.filter(p => p.isMale).length;
```
With that refactoring done, all knowledge of the subclasses is now safely encased within the superclass and the factory function. (Usually I’m wary of a superclass referring to a subclass, but this code isn’t going to last until my next cup of tea, so I’m not going worry about it.)

I now add a field to represent the difference between the subclasses; since I’m using a code loaded from elsewhere, I might as well just use that.

*class Person…*
```
constructor(name, genderCode) {
this._name = name;
this._genderCode = genderCode || "X";
}
get genderCode() {return this._genderCode;}
```
When initializing it, I set it to the default case. (As a side note, although most people can be classified as male or female, there are people who can’t. It’s a common modeling

<!-- Page 415 -->

##### mistake to forget that.)

I then take the male case and fold its logic into the superclass. This involves modifying the factory to return a Person and modifying any instanceof tests to use the gender code field.
```
function createPerson(aRecord) {
switch (aRecord.gender) {
case'M': return new Person(aRecord.name, "M");
case'F': return new Female(aRecord.name);
default: return new Person(aRecord.name);
}
}
```
*class Person…*
```
get isMale() {return "M" === this._genderCode;}
```
I test, remove the male subclass, test again, and repeat for the female subclass.
```
function createPerson(aRecord) {
switch (aRecord.gender) {
case'M': return new Person(aRecord.name, "M");
case'F': return new Person(aRecord.name, "F");
default: return new Person(aRecord.name);
}
}
```
I find the lack of symmetry with the gender code to be annoying. A future reader of the code will always wonder about this lack of symmetry. So I prefer to change the code to make it symmetrical—if I can do it without introducing any other complexity, which is the case here.
```
function createPerson(aRecord) {
switch (aRecord.gender) {
```

<!-- Page 416 -->

```
case 'M': return new Person(aRecord.name, "M");
case 'F': return new Person(aRecord.name, "F");
default: return new Person(aRecord.name, "X");
}
}
```

*class Person…*
```
constructor(name, genderCode) {
this._name = name;
this._genderCode = genderCode || "X";
}
```

### EXTRACT SUPERCLASS

<!-- Page 417 -->

#### Motivation

If I see two classes doing similar things, I can take advantage of the basic mechanism of inheritance to pull their similarities together into a superclass. I can use *Pul*l *Up Field* *(353)* to move common data into the superclass, and *Pul*l *Up Method (350)* to move the common behavior.

Many writers on object orientation treat inheritance as something that should be carefully planned in advance, based on some kind of classification structure in the “real world.” Such classification structures can be a hint towards using inheritance—but just

<!-- Page 418 -->

as often inheritance is something I realize during the evolution of a program, as I find common elements that I want to pull together.

An alternative to Extract Superclass is *Extract Class (182)*. Here you have, essentially, a choice between using inheritance or delegation as a way to unify duplicate behavior. Often Extract Superclass is the simpler approach, so I’ll do this first knowing I can use *Replace Superclass with Delegate (399)* should I need to later.

#### Mechanics

Create an empty superclass. Make the original classes its subclasses.

If needed, use *Change Function Declaration (124)* on the constructors.

Test.

One by one, use *Pull Up Constructor Body (355)*, *Pull Up Method (350)*, and *Pull* *Up Field (353)* to move common elements to the superclass.

Examine remaining methods on the subclasses. See if there are common parts. If so, use *Extract Function (106)* followed by *Pull Up Method (350)*.

Check clients of the original classes. Consider adjusting them to use the superclass interface.

#### Example

I’m pondering these two classes, they share some common functionality—their name and the notions of annual and monthly costs:
```
class Employee {
constructor(name, id, monthlyCost) {
this._id = id;
this._name = name;
this._monthlyCost = monthlyCost;
}
get monthlyCost() {return this._monthlyCost;}
get name() {return this._name;}
get id() {return this._id;}
get annualCost() {
return this.monthlyCost * 12;
}
```

<!-- Page 419 -->

```
}
class Department {
constructor(name, staff){
this._name = name;
this._staff = staff;
}
get staff() {return this._staff.slice();}
get name() {return this._name;}
get totalMonthlyCost() {
return this.staff
.map(e => e.monthlyCost)
.reduce((sum, cost) => sum + cost);
}
get headCount() {
return this.staff.length;
}
get totalAnnualCost() {
return this.totalMonthlyCost * 12;
}
}
```
I can make the common behavior more explicit by extracting a common superclass from them.

I begin by creating an empty superclass and letting them both extend from it.
```
class Party {}
class Employee extends Party {
constructor(name, id, monthlyCost) {
super();
this._id = id;
this._name = name;
this._monthlyCost = monthlyCost;
}
// rest of class...
class Department extends Party {
constructor(name, staff){
super();
this._name = name;
this._staff = staff;
}
// rest of class...
```

<!-- Page 420 -->

When doing Extract Superclass, I like to start with the data, which in JavaScript involves manipulating the constructor. So I start with *Pul*l *Up Field (353)* to pull up the name.

*class Party…*

```
constructor(name){
this._name = name;
}
```
*class Employee…*
```
constructor(name, id, monthlyCost) {
super(name);
this._id = id;
this._monthlyCost = monthlyCost;
}
```
*class Department…*

```
constructor(name, staff){
super(name);
this._staff = staff;
}
```
As I get data up to the superclass, I can also apply *Pu*ll *Up Method (350)* on associated methods. First, the name:

*class Party…*
```
get name() {return this._name;}
```
*class Employee…*
```
get name() {return this._name;}
```

<!-- Page 421 -->

*class Department…*
```
get name() {return this._name;}
```

I have two methods with similar bodies.

*class Employee…*
```
get annualCost() {
return this.monthlyCost * 12;
}
```

*class Department…*
```
get totalAnnualCost() {
return this.totalMonthlyCost * 12;
}
```

The methods they use, monthlyCost and totalMonthlyCost, have different names and different bodies—but do they represent the same intent? If so, I should use *Change* *Function Declaration (124)* to unify their names.

*class Department…*
```
get totalAnnualCost() {
return this.monthlyCost * 12;
}
get monthlyCost() { … }
```

I then do a similar renaming to the annual costs:

*class Department…*

<!-- Page 422 -->

```
get annualCost() {
return this.monthlyCost * 12;
}
```

I can now apply *Pull Up Method (350)* to the annual cost methods.

*class Party…*
```
get annualCost() {
return this.monthlyCost * 12;
}
```

*class Employee…*
```
get annualCost() {
return this.monthlyCost * 12;
}
```

*class Department…*
```
get annualCost() {
return this.monthlyCost * 12;
}
```

### COLLAPSE HIERARCHY

<!-- Page 423 -->

#### Motivation

When I’m refactoring a class hierarchy, I’m often pulling and pushing features around. As the hierarchy evolves, I sometimes find that a class and its parent are no longer different enough to be worth keeping separate. At this point, I’ll merge them together.

#### Mechanics

Choose which one to remove.

I choose based on which name makes most sense in the future. If neither name is best, I’ll pick one arbitrarily.

Use *Pull Up Field (353)*, *Push Down Field (361)*, *Pull Up Method (350)*, and *Push* *Down Method (359)* to move all the elements into a single class.

Adjust any references to the victim to change them to the class that will stay.

Remove the empty class.

Test.

### REPLACE SUBCLASS WITH DELEGATE

<!-- Page 424 -->

#### Motivation

If I have some objects whose behavior varies from category to category, the natural mechanism to express this is inheritance. I put all the common data and behavior in the superclass, and let each subclass add and override features as needed. Objectoriented languages make this simple to implement and thus a familiar mechanism.

But inheritance has its downsides. Most obviously, it’s a card that can only be played once. If I have more than one reason to vary something, I can only use inheritance for a single axis of variation. So, if I want to vary behavior of people by their age category and by their income level, I can either have subclasses for young and senior, or for welloff and poor—I can’t have both.

<!-- Page 425 -->

A further problem is that inheritance introduces a very close relationship between classes. Any change I want to make to the parent can easily break children, so I have to be careful and understand how children derive from the superclass. This problem is made worse when the logic of the two classes resides in different modules and is looked after by different teams.

Delegation handles both of these problems. I can delegate to many different classes for different reasons. Delegation is a regular relationship between objects—so I can have a clear interface to work with, which is much less coupling than subclassing. It’s therefore common to run into the problems with subclassing and apply Replace Subclass with Delegate.

There is a popular principle: “Favor object composition over class inheritance” (where composition is effectively the same as delegation). Many people take this to mean “inheritance considered harmful” and claim that we should never use inheritance. I use inheritance frequently, partly because I always know I can use Replace Subclass with Delegate should I need to change it later. Inheritance is a valuable mechanism that does the job most of the time without problems. So I reach for it first, and move onto delegation when it starts to rub badly. This usage is actually consistent with the principle—which comes from the Gang of Four book [gof] that explains how inheritance and composition work together. The principle was a reaction to the overuse of inheritance.

Those who are familiar with the Gang of Four book may find it helpful to think of this refactoring as replacing subclasses with the State or Strategy patterns. Both of these patterns are structurally the same, relying on the host delegating to a separate hierarchy. Not all cases of Replace Subclass with Delegate involve an inheritance hierarchy for the delegate (as the first example below illustrates), but setting up a hierarchy for states or strategies is often useful.

#### Mechanics

If there are many callers for the constructors, apply *Replace Constructor with* *Factory Function (334)*.

Create an empty class for the delegate. Its constructor should take any subclass specific data as well as, usually, a backreference to the superclass.

Add a field to the superclass to hold the delegate.

Modify the creation of the subclass so that it initializes the delegate field with an

<!-- Page 426 -->

##### instance of the delegate.

This can be done in the factory function, or in the constructor if the constructor can reliably tell whether to create the correct delegate.

Choose a subclass method to move to the delegate class.

Use *Move Function (198)* to move it to the delegate class. Don’t remove the source’s delegating code.

If the method needs elements that should move to the delegate, move them. If it needs elements that should stay in the superclass, add a field to the delegate that refers to the superclass.

If the source method has callers outside the class, move the source’s delegating code from the subclass to the superclass, guarding it with a check for the presence of the delegate. If not, apply *Remove Dead Code (237)*.

If there’s more than one subclass, and you start duplicating code within them, use *Extract Superclass (375)*. In this case, any delegating methods on the source super class no longer need a guard if the default behavior is moved to the delegate superclass.

Test.

Repeat until all the methods of the subclass are moved.

Find all callers of the subclasses’s constructor and change them to use the superclass constructor.

Test.

Use *Remove Dead Code (237)* on the subclass.

#### Example

I have a class that makes a booking for a show.

*class Booking…*

```
constructor(show, date) {
this._show = show;
this._date = date;
```

<!-- Page 427 -->

}

There is a subclass for premium booking that takes into account various extras that are available.

##### class PremiumBooking extends Booking…
```
constructor(show, date, extras) {
super(show, date);
this._extras = extras;
}
```
There are quite a few changes that the premium booking makes to what it inherits from the superclass. As is typical with this kind of programmingbydifference, in some cases the subclass overrides methods on the superclass, in others it adds new methods that are only relevant for the subclass. I won’t go into all of them, but I will pick out a few interesting cases.

First, there is a simple override. Regular bookings offer a talkback after the show, but only on nonpeak days.

*class Booking…*
```
get hasTalkback() {
return this._show.hasOwnProperty('talkback') &&!this.isPeakDay;
}
```
Premium bookings override this to offer talkbacks on all days.

*class PremiumBooking…*
```
get hasTalkback() {
return this._show.hasOwnProperty('talkback');
}
```
Determining the price is a similar override, with a twist that the premium method calls

<!-- Page 428 -->

##### the superclass method.

*class Booking…*
```
get basePrice() {
let result = this._show.price;
if (this.isPeakDay) result += Math.round(result * 0.15);
return result;
}
```
*class PremiumBooking…*
```
get basePrice() {
return Math.round(super.basePrice + this._extras.premiumFee);
}
```
The last example is where the premium booking offers a behavior that isn’t present on the superclass.

*class PremiumBooking…*
```
get hasDinner() {
return this._extras.hasOwnProperty('dinner') &&!this.isPeakDay;
}
```
Inheritance works well for this example. I can understand the base class without having to understand the subclass. The subclass is defined just by saying how it differs from the base case—both reducing duplication and clearly communicating what are the differences it’s introducing.

Actually, it isn’t quite as perfect as the previous paragraph implies. There are things in the superclass structure that only make sense due to the subclass—such as methods that have been factored in such a way as to make it easier to override just the right kinds of behavior. So although most of the time I can modify the base class without having to understand subclasses, there are occasions where such mindful ignorance of the subclasses will lead me to breaking a subclass by modifying the superclass.

<!-- Page 429 -->

However, if these occasions are not too common, the inheritance pays off—provided I have good tests to detect a subclass breakage.

So why would I want to change such a happy situation by using Replace Subclass with Delegate? Inheritance is a tool that can only be used once—so if I have another reason to use inheritance, and I think it will benefit me more than the premium booking subclass, I’ll need to handle premium bookings a different way. Also, I may need to change from the default booking to the premium booking dynamically—i.e., support a method like aBooking.bePremium(). In some cases, I can avoid this by creating a whole new object (a common example is where an HTTP request loads new data from the server). But sometimes, I need to modify a data structure and not rebuild it from scratch, and it is difficult to just replace a single booking that’s referred to from many different places. In such situations, it can be useful to allow a booking to switch from default to premium and back again.

When these needs crop up, I need to apply Replace Subclass with Delegate. I have clients call the constructors of the two classes to make the bookings:

*booking client*
```
aBooking = new Booking(show,date);
```
*premium client*
```
aBooking = new PremiumBooking(show, date, extras);
```
Removing subclasses will alter all of this, so I like to encapsulate the constructor calls with *Replace Constructor with Factory Function (334)*.

*top level…*
```
function createBooking(show, date) {
return new Booking(show, date);
}
function createPremiumBooking(show, date, extras) {
```

<!-- Page 430 -->

```
return new PremiumBooking (show, date, extras);
}
```
*booking client*
```
aBooking = createBooking(show, date);
```
*premium client*
```
aBooking = createPremiumBooking(show, date, extras);
```
I now make the new delegate class. Its constructor parameters are those parameters that are only used in the subclass, together with a backreference to the booking object. I’ll need this because several subclass methods require access to data stored in the superclass. Inheritance makes this easy to do, but with a delegate I need a back reference.

*class PremiumBookingDelegate…*
```
constructor(hostBooking, extras) {
this._host = hostBooking;
this._extras = extras;
}
```
I now connect the new delegate to the booking object. I do this by modifying the factory function for premium bookings.

*top level…*
```
function createPremiumBooking(show, date, extras) {
const result = new PremiumBooking (show, date, extras);
result._bePremium(extras);
return result;
}
```

<!-- Page 431 -->

*class Booking…*
```
_bePremium(extras) {
this._premiumDelegate = new PremiumBookingDelegate(this, extras);
}
```
I use a leading underscore on _bePremium to indicate that it shouldn’t be part of the public interface for Booking. Of course, if the point of doing this refactoring is to allow a booking to mutate to premium, it can be a public method.

Alternatively, I can do all the connections in the constructor for Booking. In order to do that, I need some way to signal to the constructor that we have a premium booking. That could be an extra parameter, or just the use of extras if I can be sure that it is always present when used with a premium booking. Here, I prefer the explicitness of doing this through the factory function.

With the structures set up, it’s time to start moving the behavior. The first case I’ll consider is the simple override of hasTalkback. Here’s the existing code:

*class Booking…*
```
get hasTalkback() {
return this._show.hasOwnProperty('talkback') &&!this.isPeakDay;
}
```
*class PremiumBooking…*
```
get hasTalkback() {
return this._show.hasOwnProperty('talkback');
}
```
I use *Move Function (198)* to move the subclass method to the delegate. To make it fit its home, I route any access to superclass data with a call to _host.

<!-- Page 432 -->

*class PremiumBookingDelegate…*
```
get hasTalkback() {
return this._host._show.hasOwnProperty('talkback');
}
```
*class PremiumBooking…*
```
get hasTalkback() {
return this._premiumDelegate.hasTalkback;
}
```
I test to ensure everything is working, then delete the subclass method:

*class PremiumBooking…*
```
get hasTalkback() {
return this._premiumDelegate.hasTalkback;
}
```
I run the tests at this point, expecting some to fail.

Now I finish the move by adding dispatch logic to the superclass method to use the delegate if it is present.

*class Booking…*
```
get hasTalkback() {
return (this._premiumDelegate)
? this._premiumDelegate.hasTalkback
: this._show.hasOwnProperty('talkback') &&!this.isPeakDay;
}
```
The next case I’ll look at is the base price.

<!-- Page 433 -->

*class Booking…*
```
get basePrice() {
let result = this._show.price;
if (this.isPeakDay) result += Math.round(result * 0.15);
return result;
}
```
*class PremiumBooking…*
```
get basePrice() {
return Math.round(super.basePrice + this._extras.premiumFee);
}
```
This is almost the same, but there is a wrinkle in the form of the pesky call on super (which is pretty common in these kinds of subclass extension cases). When I move the subclass code to the delegate, I’ll need to call the parent case—but I can’t just call this._host._basePrice without getting into an endless recursion.

I have a couple of options here. One is to apply *Extract Function (106)* on the base calculation to allow me to separate the dispatch logic from price calculation. (The rest of the move is as before.)

*class Booking…*
```
get basePrice() {
return (this._premiumDelegate)
? this._premiumDelegate.basePrice
: this._privateBasePrice;
}
get _privateBasePrice() {
let result = this._show.price;
if (this.isPeakDay) result += Math.round(result * 0.15);
return result;
}
```
*class PremiumBookingDelegate…*

<!-- Page 434 -->

```
get basePrice() {
return Math.round(this._host._privateBasePrice + this._extras.premiumFee);
}
```
Alternatively, I can recast the delegate’s method as an extension of the base method.

*class Booking…*
```
get basePrice() {
let result = this._show.price;
if (this.isPeakDay) result += Math.round(result * 0.15);
return (this._premiumDelegate)
? this._premiumDelegate.extendBasePrice(result)
: result;
}
```
*class PremiumBookingDelegate…*
```
extendBasePrice(base) {
return Math.round(base + this._extras.premiumFee);
}
```
Both work reasonably here; I have a slight preference for the latter as it’s a bit smaller.

The last case is a method that only exists on the subclass.

*class PremiumBooking…*
```
get hasDinner() {
return this._extras.hasOwnProperty('dinner') &&!this.isPeakDay;
}
```
I move it from the subclass to the delegate:

<!-- Page 435 -->

*class PremiumBookingDelegate…*
```
get hasDinner() {
return this._extras.hasOwnProperty('dinner') &&!this._host.isPeakDay;
}
```
I then add dispatch logic to Booking:

*class Booking…*
```
get hasDinner() {
return (this._premiumDelegate)
? this._premiumDelegate.hasDinner
: undefined;
}
```
In JavaScript, accessing a property on an object where it isn’t defined returns undefined, so I do that here. (Although my every instinct is to have it raise an error, which would be the case in other objectoriented dynamic languages I’m used to.)

Once I’ve moved all the behavior out of the subclass, I can change the factory method to return the superclass—and, once I’ve run tests to ensure all is well, delete the subclass.

*top level…*
```
function createPremiumBooking(show, date, extras) {
const result = new PremiumBooking (show, date, extras);
result._bePremium(extras);
return result;
}
class PremiumBooking extends Booking...
```
This is one of those refactorings where I don’t feel that refactoring alone improves the code. Inheritance handles this situation very well, whereas using delegation involves adding dispatch logic, twoway references, and thus extra complexity. The refactoring

<!-- Page 436 -->

may still be worthwhile, since the advantage of a mutable premium status, or a need to use inheritance for other purposes, may outweigh the disadvantage of losing inheritance.

#### Example: Replacing a Hierarchy

The previous example showed using Replace Subclass with Delegate on a single subclass, but I can do the same thing with an entire hierarchy.
```
function createBird(data) {
switch (data.type) {
case'EuropeanSwallow':
return new EuropeanSwallow(data);
case'AfricanSwallow':
return new AfricanSwallow(data);
case'NorweigianBlueParrot':
return new NorwegianBlueParrot(data);
default:
return new Bird(data);
}
}
class Bird {
constructor(data) {
this._name = data.name;
this._plumage = data.plumage;
}
get name() {return this._name;}
get plumage() {
return this._plumage || "average";
}
get airSpeedVelocity() {return null;}
}
class EuropeanSwallow extends Bird {
get airSpeedVelocity() {return 35;}
}
class AfricanSwallow extends Bird {
constructor(data) {
super (data);
this._numberOfCoconuts = data.numberOfCoconuts;
}
get airSpeedVelocity() {
return 40 2 * this._numberOfCoconuts;
}
}
```

<!-- Page 437 -->

```
class NorwegianBlueParrot extends Bird {
constructor(data) {
super (data);
this._voltage = data.voltage;
this._isNailed = data.isNailed;
}
get plumage() {
if (this._voltage > 100) return "scorched";
else return this._plumage || "beautiful";
}
get airSpeedVelocity() {
return (this._isNailed)? 0 : 10 + this._voltage / 10;
}
}
```
The system will shortly be making a big difference between birds tagged in the wild and those tagged in captivity. That difference could be modeled as two subclasses for Bird: WildBird and CaptiveBird. However, I can only use inheritance once, so if I want to use subclasses for wild versus captive, I’ll have to remove them for the species.

When several subclasses are involved, I’ll tackle them one at a time, starting with a simple one—in this case, EuropeanSwallow. I create an empty delegate class for the delegate.
```
class EuropeanSwallowDelegate {
}
```
I don’t put in any data or backreference parameters yet. For this example, I’ll introduce them as I need them.

I need to decide where to handle the initialization of the delegate field. Here, since I have all the information in the single data argument to the constructor, I decide to do it in the constructor. Since there are several delegates I could add, I make a function to select the correct one based on the type code in the document.

*class Bird…*
```
constructor(data) {
```

<!-- Page 438 -->

```
this._name = data.name;
this._plumage = data.plumage;
this._speciesDelegate = this.selectSpeciesDelegate(data);
}
selectSpeciesDelegate(data) {
switch(data.type) {
case 'EuropeanSwallow':
return new EuropeanSwallowDelegate();
default: return null;
}
}
```

Now I have the structure set up, I can apply *Move Function (198)* to the European swallow’s air speed velocity.

*class EuropeanSwallowDelegate…*
```
get airSpeedVelocity() {return 35;}
```

*class EuropeanSwallow…*
```
get airSpeedVelocity() {return this._speciesDelegate.airSpeedVelocity;}
```

I change airSpeedVelocity on the superclass to call a delegate, if present.

*class Bird…*
```
get airSpeedVelocity() {
return this._speciesDelegate ? this._speciesDelegate.airSpeedVelocity : null;
}
```

I remove the subclass.

<!-- Page 439 -->

```
class EuropeanSwallow extends Bird {
get airSpeedVelocity() {return this._speciesDelegate.airSpeedVelocity;}
}
```
*top level…*
```
function createBird(data) {
switch (data.type) {
case'EuropeanSwallow':
return new EuropeanSwallow(data);
case'AfricanSwallow':
return new AfricanSwallow(data);
case'NorweigianBlueParrot':
return new NorwegianBlueParrot(data);
default:
return new Bird(data);
}
}
```
Next I’ll tackle the African swallow. I create a class; this time, the constructor needs the data document.

*class AfricanSwallowDelegate…*
```
constructor(data) {
this._numberOfCoconuts = data.numberOfCoconuts;
}
```
*class Bird…*
```
selectSpeciesDelegate(data) {
switch(data.type) {
case'EuropeanSwallow':
return new EuropeanSwallowDelegate();
case'AfricanSwallow':
return new AfricanSwallowDelegate(data);
default: return null;
}
```

<!-- Page 440 -->

}

I use *Move Function (198)* on airSpeedVelocity.

*class AfricanSwallowDelegate…*
```
get airSpeedVelocity() {
return 40 2 * this._numberOfCoconuts;
}
```
*class AfricanSwallow…*
```
get airSpeedVelocity() {
return this._speciesDelegate.airSpeedVelocity;
}
```
I can now remove the African swallow subclass.
```
class AfricanSwallow extends Bird {
// all of the body...
}
function createBird(data) {
switch (data.type) {
case'AfricanSwallow':
return new AfricanSwallow(data);
case'NorweigianBlueParrot':
return new NorwegianBlueParrot(data);
default:
return new Bird(data);
}
}
```
Now for the Norwegian blue. Creating the class and moving the air speed velocity uses the same steps as before, so I’ll just show the result.

*class Bird…*

<!-- Page 441 -->

```
selectSpeciesDelegate(data) {
switch(data.type) {
case'EuropeanSwallow':
return new EuropeanSwallowDelegate();
case'AfricanSwallow':
return new AfricanSwallowDelegate(data);
case'NorweigianBlueParrot':
return new NorwegianBlueParrotDelegate(data);
default: return null;
}
}
```
*class NorwegianBlueParrotDelegate…*
```
constructor(data) {
this._voltage = data.voltage;
this._isNailed = data.isNailed;
}
get airSpeedVelocity() {
return (this._isNailed)? 0 : 10 + this._voltage / 10;
}
```
All well and good, but the Norwegian blue overrides the plumage property, which I didn’t have to deal with for the other cases. The initial *Move Function (198)* is simple enough, albeit with the need to modify the constructor to put in a backreference to the bird.

*class NorwegianBlueParrot…*
```
get plumage() {
return this._speciesDelegate.plumage;
}
```
*class NorwegianBlueParrotDelegate…*
```
get plumage() {
```

<!-- Page 442 -->

```
if (this._voltage > 100) return "scorched";
else return this._bird._plumage || "beautiful";
}
constructor(data, bird) {
this._bird = bird;
this._voltage = data.voltage;
this._isNailed = data.isNailed;
}
```
*class Bird…*
```
selectSpeciesDelegate(data) {
switch(data.type) {
case'EuropeanSwallow':
return new EuropeanSwallowDelegate();
case'AfricanSwallow':
return new AfricanSwallowDelegate(data);
case'NorweigianBlueParrot':
return new NorwegianBlueParrotDelegate(data, this);
default: return null;
}
}
```
The tricky step is how to remove the subclass method for plumage. If I do

*class Bird…*
```
get plumage() {
if (this._speciesDelegate)
return this._speciesDelegate.plumage;
else
return this._plumage || "average";
}
```
then I’ll get a bunch of errors because there is no plumage property on the other species’ delegate classes.

I could use a more precise conditional:

*class Bird…*

<!-- Page 443 -->

```
get plumage() {
if (this._speciesDelegate instanceof NorwegianBlueParrotDelegate)
return this._speciesDelegate.plumage;
else
return this._plumage || "average";
}
```
But I hope that smells as much of decomposing parrot to you as it does to me. It’s almost never a good idea to use an explicit class check like this.

Another option is to implement the default case on the other delegates.

*class Bird…*
```
get plumage() {
if (this._speciesDelegate)
return this._speciesDelegate.plumage;
else
return this._plumage || "average";
}
```
*class EuropeanSwallowDelegate…*
```
get plumage() {
return this._bird._plumage || "average";
}
```
*class AfricanSwallowDelegate…*
```
get plumage() {
return this._bird._plumage || "average";
}
```
But this duplicates the default method for plumage. And if that’s not bad enough, I also get some bonus duplication in the constructors to assign the backreference.

<!-- Page 444 -->

The solution to the duplication is, naturally, inheritance—I apply *Extract Superclass* *(375)* to the species delegates:
```
class SpeciesDelegate {
constructor(data, bird) {
this._bird = bird;
}
get plumage() {
return this._bird._plumage || "average";
}
class EuropeanSwallowDelegate extends SpeciesDelegate {
class AfricanSwallowDelegate extends SpeciesDelegate {
constructor(data, bird) {
super(data,bird);
this._numberOfCoconuts = data.numberOfCoconuts;
}
class NorwegianBlueParrotDelegate extends SpeciesDelegate {
constructor(data, bird) {
super(data, bird);
this._voltage = data.voltage;
this._isNailed = data.isNailed;
}
```
Indeed, now I have a superclass, I can move any default behavior from Bird to SpeciesDelegate by ensuring there’s always something in the speciesDelegate field.

*class Bird…*
```
selectSpeciesDelegate(data) {
switch(data.type) {
case'EuropeanSwallow':
return new EuropeanSwallowDelegate(data, this);
case'AfricanSwallow':
return new AfricanSwallowDelegate(data, this);
case'NorweigianBlueParrot':
return new NorwegianBlueParrotDelegate(data, this);
default: return new SpeciesDelegate(data, this);
}
}
// rest of bird's code...
```

<!-- Page 445 -->

```
get plumage() {return this._speciesDelegate.plumage;}
get airSpeedVelocity() {return this._speciesDelegate.airSpeedVelocity;}
```
*class SpeciesDelegate…*
```
get airSpeedVelocity() {return null;}
```
I like this, as it simplifies the delegating methods on Bird. I can easily see which behavior is delegated to the species delegate and which stays behind.

Here’s the final state of these classes:
```
function createBird(data) {
return new Bird(data);
}
class Bird {
constructor(data) {
this._name = data.name;
this._plumage = data.plumage;
this._speciesDelegate = this.selectSpeciesDelegate(data);
}
get name() {return this._name;}
get plumage() {return this._speciesDelegate.plumage;}
get airSpeedVelocity() {return this._speciesDelegate.airSpeedVelocity;}
selectSpeciesDelegate(data) {
switch(data.type) {
case'EuropeanSwallow':
return new EuropeanSwallowDelegate(data, this);
case'AfricanSwallow':
return new AfricanSwallowDelegate(data, this);
case'NorweigianBlueParrot':
return new NorwegianBlueParrotDelegate(data, this);
default: return new SpeciesDelegate(data, this);
}
}
// rest of bird's code...
}
class SpeciesDelegate {
constructor(data, bird) {
```

<!-- Page 446 -->

```
this._bird = bird;
}
get plumage() {
return this._bird._plumage || "average";
}
get airSpeedVelocity() {return null;}
}
class EuropeanSwallowDelegate extends SpeciesDelegate {
get airSpeedVelocity() {return 35;}
}
class AfricanSwallowDelegate extends SpeciesDelegate {
constructor(data, bird) {
super(data,bird);
this._numberOfCoconuts = data.numberOfCoconuts;
}
get airSpeedVelocity() {
return 40 2 * this._numberOfCoconuts;
}
}
class NorwegianBlueParrotDelegate extends SpeciesDelegate {
constructor(data, bird) {
super(data, bird);
this._voltage = data.voltage;
this._isNailed = data.isNailed;
}
get airSpeedVelocity() {
return (this._isNailed)? 0 : 10 + this._voltage / 10;
}
get plumage() {
if (this._voltage > 100) return "scorched";
else return this._bird._plumage || "beautiful";
}
}
```
This example replaces the original subclasses with a delegate, but there is still a very similar inheritance structure in SpeciesDelegate. Have I gained anything from this refactoring, other than freeing up inheritance on Bird? The species inheritance is now more tightly scoped, covering just the data and functions that vary due to the species. Any code that’s the same for all species remains on Bird and its future subclasses.

I could apply the same idea of creating a superclass delegate to the booking example earlier. This would allow me to replace those methods on Booking that have dispatch logic with simple calls to the delegate and letting its inheritance sort out the dispatch. However, it’s nearly dinner time, so I’ll leave that as an exercise for the reader.

<!-- Page 447 -->

These examples illustrate that the phrase “Favor object composition over class inheritance” might better be said as “Favor a judicious mixture of composition and inheritance over either alone”—but I fear that is not as catchy.

### REPLACE SUPERCLASS WITH DELEGATE

##### formerly: Replace Inheritance with Delegation

#### Motivation

In objectoriented programs, inheritance is a powerful and easily available way to reuse existing functionality. I inherit from some existing class, then override and add additional features. But subclassing can be done in a way that leads to confusion and complication.

One of the classic examples of misinheritance from the early days of objects was making a stack be a subclass of list. The idea that led to this was reusing of list’s data storage and operations to manipulate it. While it’s good to reuse, this inheritance had a problem: All the operations of the list were present on the interface of the stack, although most of them were not applicable to a stack. A better approach is to make the list into a field of the stack and delegate the necessary operations to it.

This is an example of one reason to use Replace Superclass with Delegate—if functions

<!-- Page 448 -->

of the superclass don’t make sense on the subclass, that’s a sign that I shouldn’t be using inheritance to use the superclass’s functionality.

As well as using all the functions of the superclass, it should also be true that every instance of the subclass is an instance of the superclass and a valid object in all cases where we’re using the superclass. If I have a car model class, with things like name and engine size, I might think I could reuse these features to represent a physical car, adding functions for VIN number and manufacturing date. This is a common, and often subtle, modeling mistake which I’ve called the typeinstance homonym [mftih].

These are both examples of problems leading to confusion and errors—which can be easily avoided by replacing inheritance with delegation to a separate object. Using delegation makes it clear that it is a separate thing—one where only some of the functions carry over.

Even in cases where the subclass is reasonable modeling, I use Replace Superclass with Delegate because the relationship between a sub and superclass is highly coupled, with the subclass easily broken by changes in the superclass. The downside is that I need to write a forwarding function for any function that is the same in the host and in the delegate—but, fortunately, even though such forwarding functions are boring to write, they are too simple to get wrong.

As a consequence of all this, some people advise avoiding inheritance entirely—but I don’t agree with that. Provided the appropriate semantic conditions apply (every method on the supertype applies to the subtype, every instance of the subtype is an instance of the supertype), inheritance is a simple and effective mechanism. I can easily apply Replace Superclass with Delegate should the situation change and inheritance is no longer the best option. So my advice is to (mostly) use inheritance first, and apply Replace Superclass with Delegate when (and if) it becomes a problem.

#### Mechanics

Create a field in the subclass that refers to the superclass object. Initialize this delegate reference to a new instance.

For each element of the superclass, create a forwarding function in the subclass that forwards to the delegate reference. Test after forwarding each consistent group.

Most of the time you can test after each function that’s forwarded, but, for example, get/set pairs can only be tested once both have been moved.

<!-- Page 449 -->

When all superclass elements have been overridden with forwarders, remove the inheritance link.

#### Example

I recently was consulting for an old town’s library of ancient scrolls. They keep details of their scrolls in a catalog. Each scroll has an ID number and records its title and list of tags.

*class CatalogItem…*
```
constructor(id, title, tags) {
this._id = id;
this._title = title;
this._tags = tags;
}
get id() {return this._id;}
get title() {return this._title;}
hasTag(arg) {return this._tags.includes(arg);}
```
One of the things that scrolls need is regular cleaning. The code for that uses the catalog item and extends it with the data it needs for cleaning.

##### class Scroll extends CatalogItem…
```
constructor(id, title, tags, dateLastCleaned) {
super(id, title, tags);
this._lastCleaned = dateLastCleaned;
}
needsCleaning(targetDate) {
const threshold = this.hasTag("revered")? 700 : 1500;
return this.daysSinceLastCleaning(targetDate) > threshold ;
}
daysSinceLastCleaning(targetDate) {
return this._lastCleaned.until(targetDate, ChronoUnit.DAYS);
}
```
This is an example of a common modeling error. There is a difference between the physical scroll and the catalog item. The scroll describing the treatment for the

<!-- Page 450 -->

greyscale disease may have several copies, but be just one item in the catalog.

It many situations, I can get away with an error like this. I can think of the title and tags as copies of data in the catalog. Should this data never change, I can get away with this representation. But if I need to update either, I must be careful to ensure that all copies of the same catalog item are updated correctly.

Even without this issue, I’d still want to change the relationship. Using catalog item as a superclass to scroll is likely to confuse programmers in the future, and is thus a poor model to work with.

I begin by creating a property in Scroll that refers to the catalog item, initializing it with a new instance.

##### class Scroll extends CatalogItem…
```
constructor(id, title, tags, dateLastCleaned) {
super(id, title, tags);
this._catalogItem = new CatalogItem(id, title, tags);
this._lastCleaned = dateLastCleaned;
}
```
I create forwarding methods for each element of the superclass that I use on the subclass.

*class Scroll…*
```
get id() {return this._catalogItem.id;}
get title() {return this._catalogItem.title;}
hasTag(aString) {return this._catalogItem.hasTag(aString);}
```
I remove the inheritance link to the catalog item.
```
class Scroll extends CatalogItem{
constructor(id, title, tags, dateLastCleaned) {
super(id, title, tags);
this._catalogItem = new CatalogItem(id, title, tags);
```

<!-- Page 451 -->

```
this._lastCleaned = dateLastCleaned;
}
```
Breaking the inheritance link finishes the basic Replace Superclass with Delegate refactoring, but there is something more I need to do in this case.

The refactoring shifts the role of the catalog item to that of a component of scroll; each scroll contains a unique instance of a catalog item. In many cases where I do this refactoring, this is enough. However, in this situation a better model is to link the greyscale catalog item to the six scrolls in the library that are copies of that writing. Doing this is, essentially, *Change Value to Reference (256)*.

There’s a problem that I have to fix, however, before I use *Change Value to Reference* *(256)*. In the original inheritance structure, the scroll used the catalog item’s ID field to store its ID. But if I treat the catalog item as a reference, it needs to use that ID for the catalog item ID rather than the scroll ID. This means I need to create an ID field on scroll and use that instead of one in catalog item. It’s a sortof move, sortof split.

*class Scroll…*
```
constructor(id, title, tags, dateLastCleaned) {
this._id = id;
this._catalogItem = new CatalogItem(null, title, tags);
this._lastCleaned = dateLastCleaned;
}
get id() {return this._id;}
```
Creating a catalog item with a null ID would usually raise red flags and cause alarms to sound. But that’s just temporary while I get things into shape. Once I’ve done that, the scrolls will refer to a shared catalog item with its proper ID.

Currently the scrolls are loaded as part of a load routine.

*load routine…*
```
const scrolls = aDocument
.map(record => new Scroll(record.id,
record.catalogData.title,
```

<!-- Page 452 -->

```
record.catalogData.tags,
LocalDate.parse(record.lastCleaned)));
```
The first step in *Change Value to Reference (256)* is finding or creating a repository. I find there is a repository that I can easily import into the load routine. The repository supplies catalog items indexed by an ID. My next task is to see how to get that ID into the constructor of the scroll. Fortunately, it’s present in the input data and was being ignored as it wasn’t useful when using inheritance. With that sorted out, I can now use *Change Function Declaration (124)* to add both the catalog and the catalog item’s ID to the constructor parameters.

*load routine…*
```
const scrolls = aDocument
.map(record => new Scroll(record.id,
record.catalogData.title,
record.catalogData.tags,
LocalDate.parse(record.lastCleaned),
record.catalogData.id,
catalog));
```
*class Scroll…*
```
constructor(id, title, tags, dateLastCleaned, catalogID, catalog) {
this._id = id;
this._catalogItem = new CatalogItem(null, title, tags);
this._lastCleaned = dateLastCleaned;
}
```
I now modify the constructor to use the catalog ID to look up the catalog item and use it instead of creating a new one.

*class Scroll…*
```
constructor(id, title, tags, dateLastCleaned, catalogID, catalog) {
this._id = id;
this._catalogItem = catalog.get(catalogID);
```

<!-- Page 453 -->

```
this._lastCleaned = dateLastCleaned;
}
```
I no longer need the title and tags passed into the constructor, so I use *Change* *Function Declaration (124)* to remove them.

*load routine…*
```
const scrolls = aDocument
.map(record => new Scroll(record.id,
record.catalogData.title,
record.catalogData.tags,
LocalDate.parse(record.lastCleaned),
record.catalogData.id,
catalog));
```
*class Scroll…*
```
constructor(id, title, tags, dateLastCleaned, catalogID, catalog) {
this._id = id;
this._catalogItem = catalog.get(catalogID);
this._lastCleaned = dateLastCleaned;
}
```
