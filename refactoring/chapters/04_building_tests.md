# Chapter 4: Building Tests

> **Pages:** 100 – 117
> **Summary:** The Value of Self-Testing Code, sample code to test, writing a first test, adding another test, modifying the fixture, and probing the boundaries. Tests as the foundation that makes refactoring safe.

---

## Chapter 4 Building Tests

Refactoring is a valuable tool, but it can’t come alone. To do refactoring properly, I need a solid suite of tests to spot my inevitable mistakes. Even with automated refactoring tools, many of my refactorings will still need checking via a test suite. I don’t find this to be a disadvantage. Even without refactoring, writing good tests increases my effectiveness as a programmer. This was a surprise for me and is counterintuitive for most programmers—so it’s worth explaining why.

### THE VALUE OF SELF-TESTING CODE

If you look at how most programmers spend their time, you’ll find that writing code is actually quite a small fraction. Some time is spent figuring out what ought to be going on, some time is spent designing, but most time is spent debugging. I’m sure every reader can remember long hours of debugging—often, well into the night. Every programmer can tell a story of a bug that took a whole day (or more) to find. Fixing the bug is usually pretty quick, but finding it is a nightmare. And then, when you do fix a bug, there’s always a chance that another one will appear and that you might not even notice it till much later. And you’ll spend ages finding that bug.

The event that started me on the road to selftesting code was a talk at OOPSLA in

1992. Someone (I think it was “Bedarra” Dave Thomas) said offhandedly, “Classes should contain their own tests.” So I decided to incorporate tests into the code base together with the production code. As I was also doing iterative development, I tried adding tests as I completed each iteration. The project on which I was working at that time was quite small, so we put out iterations every week or so. Running the tests became fairly straightforward—but although it was easy, it was still pretty boring. This was because every test produced output to the console that I had to check. Now I’m a pretty lazy person and am prepared to work quite hard in order to avoid work. I realized that, instead of looking at the screen to see if it printed out some information from the model, I could get the computer to make that test. All I had to do was put the

<!-- Page 101 -->

output I expected in the test code and do a comparison. Now I could run the tests and they would just print “OK” to the screen if all was well. The software was now self testing.

*Make sure all tests are fully automatic and that they check their own results.*

Now it was easy to run tests—as easy as compiling. So I started to run tests every time I compiled. Soon, I began to notice my productivity had shot upward. I realized that I wasn’t spending so much time debugging. If I added a bug that was caught by a previous test, it would show up as soon as I ran that test. The test had worked before, so I would know that the bug was in the work I had done since I last tested. And I ran the tests frequently—which means only a few minutes had elapsed. I thus knew that the source of the bug was the code I had just written. As it was a small amount of code that was still fresh in my mind, the bug was easy to find. Bugs that would have otherwise taken an hour or more to find now took a couple of minutes at most. Not only was my software selftesting, but by running the tests frequently I had a powerful bug detector.

As I noticed this, I became more aggressive about doing the tests. Instead of waiting for the end of an increment, I would add the tests immediately after writing a bit of function. Every day I would add a couple of new features and the tests to test them. I hardly ever spent more than a few minutes hunting for a regression bug.

*A suite of tests is a powerful bug detector that decapitates the time it takes to* *find bugs.*

Tools for writing and organizing these tests have developed a great deal since my experiments. While flying from Switzerland to Atlanta for OOPSLA 1997, Kent Beck paired with Erich Gamma to port his unit testing framework from Smalltalk to Java. The resulting framework, called JUnit, has been enormously influential for program testing, inspiring a huge variety of similar tools [mfxunit] in lots of different languages.

Admittedly, it is not so easy to persuade others to follow this route. Writing the tests means a lot of extra code to write. Unless you have actually experienced how it speeds programming, selftesting does not seem to make sense. This is not helped by the fact that many people have never learned to write tests or even to think about tests. When tests are manual, they are gutwrenchingly boring. But when they are automatic, tests can actually be quite fun to write.

<!-- Page 102 -->

In fact, one of the most useful times to write tests is before I start programming. When I need to add a feature, I begin by writing the test. This isn’t as backward as it sounds. By writing the test, I’m asking myself what needs to be done to add the function. Writing the test also concentrates me on the interface rather than the implementation (always a good thing). It also means I have a clear point at which I’m done coding— when the test works.

Kent Beck baked this habit of writing the test first into a technique called TestDriven Development (TDD) [mftdd]. The TestDriven Development approach to programming relies on short cycles of writing a (failing) test, writing the code to make that test work, and refactoring to ensure the result is as clean as possible. This test coderefactor cycle should occur many times per hour, and can be a very productive and calming way to write code. I’m not going to discuss it further here, but I do use and warmly recommend it.

That’s enough of the polemic. Although I believe everyone would benefit by writing self testing code, it is not the point of this book. This book is about refactoring. Refactoring requires tests. If you want to refactor, you have to write tests. This chapter gives you a start in doing this for JavaScript. This is not a testing book, so I’m not going to go into much detail. I’ve found, however, that with testing a remarkably small amount of work can have surprisingly big benefits.

As with everything else in this book, I describe the testing approach using examples. When I develop code, I write the tests as I go. But sometimes, I need to refactor some code without tests—then I have to make the code selftesting before I begin.

### SAMPLE CODE TO TEST

Here’s some code to look at and test. The code supports a simple application that allows a user to examine and manipulate a production plan. The (crude) UI looks like this:

<!-- Page 103 -->

The production plan has a demand and price for each province. Each province has producers, each of which can produce a certain number of units at a particular price. The UI also shows how much revenue each producer would earn if they sell all their production. At the bottom, the screen shows the shortfall in production (the demand minus the total production) and the profit for this plan. The UI allows the user to manipulate the demand, price, and the individual producer’s production and costs to see the effect on the production shortfall and profits. Whenever a user changes any number in the display, all the others update immediately.

I’m showing a user interface here, so you can sense how the software is used, but I’m only going to concentrate on the business logic part of the software—that is, the classes that calculate the profit and the shortfall, not the code that generates the HTML and hooks up the field changes to the underlying business logic. This chapter is just an introduction to the world of selftesting code, so it makes sense for me to start with the easiest case—which is code that doesn’t involve user interface, persistence, or external service interaction. Such separation, however, is a good idea in any case: Once this kind of business logic gets at all complicated, I will separate it from the UI mechanics so I can more easily reason about it and test it.

This business logic code involves two classes: one that represents a single producer, and the other that represents a whole province. The province’s constructor takes a JavaScript object—one we could imagine being supplied by a JSON document.

Here’s the code that loads the province from the JSON data:

*class Province…*

<!-- Page 104 -->

```
constructor(doc) {
this._name = doc.name;
this._producers = [];
this._totalProduction = 0;
this._demand = doc.demand;
this._price = doc.price;
doc.producers.forEach(d => this.addProducer(new Producer(this, d)));
}
addProducer(arg) {
this._producers.push(arg);
this._totalProduction += arg.production;
}
```

This function creates suitable JSON data. I can create a sample province for testing by constructing a province object with the result of this function.

*top level…*
```
function sampleProvinceData() {
return {
name: "Asia",
producers: [
{name: "Byzantium", cost: 10, production: 9},
{name: "Attalia", cost: 12, production: 10},
{name: "Sinope", cost: 10, production: 6},
],
demand: 30,
price: 20
};
}
```

The province class has accessors for the various data values:

*class Province…*
```
get name() {return this._name;}
get producers() {return this._producers.slice();}
get totalProduction() {return this._totalProduction;}
set totalProduction(arg) {this._totalProduction = arg;}
get demand() {return this._demand;}
set demand(arg) {this._demand = parseInt(arg);}
```

<!-- Page 105 -->

```
get price() {return this._price;}
set price(arg) {this._price = parseInt(arg);}
```
The setters will be called with strings from the UI that contain the numbers, so I need to parse the numbers to use them reliably in calculations.

The producer class is mostly a simple data holder:

*class Producer…*
```
constructor(aProvince, data) {
this._province = aProvince;
this._cost = data.cost;
this._name = data.name;
this._production = data.production || 0;
}
get name() {return this._name;}
get cost() {return this._cost;}
set cost(arg) {this._cost = parseInt(arg);}
get production() {return this._production;}
set production(amountStr) {
const amount = parseInt(amountStr);
const newProduction = Number.isNaN(amount)? 0 : amount;
this._province.totalProduction += newProduction this._production;
this._production = newProduction;
}
```
The way that set production updates the derived data in the province is ugly, and whenever I see that I want to refactor to remove it. But I have to write tests before that I can refactor it.

The calculation for the shortfall is simple.

*class Province…*
```
get shortfall() {
return this._demand this.totalProduction;
}
```
That for the profit is a bit more involved.

<!-- Page 106 -->

*class Province…*
```
get profit() {
return this.demandValue this.demandCost;
}
get demandCost() {
let remainingDemand = this.demand;
let result = 0;
this.producers
.sort((a,b) => a.cost b.cost)
.forEach(p => {
const contribution = Math.min(remainingDemand, p.production);
remainingDemand = contribution;
result += contribution * p.cost;
});
return result;
}
get demandValue() {
return this.satisfiedDemand * this.price;
}
get satisfiedDemand() {
return Math.min(this._demand, this.totalProduction);
}
```
### A FIRST TEST

To test this code, I’ll need some sort of testing framework. There are many out there, even just for JavaScript. The one I’ll use is Mocha [mocha], which is reasonably common and wellregarded. I won’t go into a full explanation of how to use the framework, just show some example tests with it. You should be able to adapt, easily enough, a different framework to build similar tests.

Here is a simple test for the shortfall calculation:
```
describe('province', function() {
it('shortfall', function() {
const asia = new Province(sampleProvinceData());
assert.equal(asia.shortfall, 5);
});
});
```
The Mocha framework divides up the test code into blocks, each grouping together a

<!-- Page 107 -->

suite of tests. Each test appears in an it block. For this simple case, the test has two steps. The first step sets up some fixture—data and objects that are needed for the test: in this case, a loaded province object. The second line verifies some characteristic of that fixture—in this case, that the shortfall is the amount that should be expected given the initial data.

Different developers use the descriptive strings in the describe and it blocks differently. Some would write a sentence that explains what the test is testing, but others prefer to leave them empty, arguing that the descriptive sentence is just duplicating the code in the same way a comment does. I like to put in just enough to identify which test is which when I get failures.

If I run this test in a NodeJS console, the output looks like this:

```
’’’’’’’’’’’’’’
1 passing (61ms)
```
Note the simplicity of the feedback—just a summary of how many tests are run and how many have passed.

*Always make sure a test will fail when it should.*

When I write a test against existing code like this, it’s nice to see that all is well—but I’m naturally skeptical. Particularly, once I have a lot of tests running, I’m always nervous that a test isn’t really exercising the code the way I think it is, and thus won’t catch a bug when I need it to. So I like to see every test fail at least once when I write it. My favorite way of doing that is to temporarily inject a fault into the code, for example:

*class Province…*
```
get shortfall() {
return this._demand this.totalProduction * 2;
}
```
Here’s what the console now looks like:

<!-- Page 108 -->

1) province shortfall: AssertionError: expected 20 to equal 5 at Context.<anonymous> (src/tester.js:10:12)
```
!
0 passing (72ms)
1 failing
```
The framework indicates which test failed and gives some information about the nature of the failure—in this case, what value was expected and what value actually turned up. I therefore notice at once that something failed—and I can immediately see which tests failed, giving me a clue as to what went wrong (and, in this case, confirming the failure was where I injected it).

*Run tests frequently. Run those exercising the code you’re working on at least* *every few minutes; run all tests at least daily.*

In a real system, I might have thousands of tests. A good test framework allows me to run them easily and to quickly see if any have failed. This simple feedback is essential to selftesting code. When I work, I’ll be running tests very frequently—checking progress with new code or checking for mistakes with refactoring.

The Mocha framework can use different libraries, which it calls assertion libraries, to verify the fixture for a test. Being JavaScript, there are a quadzillion of them out there, some of which may still be current when you’re reading this. The one I’m using at the moment is Chai [chai]. Chai allows me to write my validations either using an “assert” style:
```
describe('province', function() {
it('shortfall', function() {
const asia = new Province(sampleProvinceData());
assert.equal(asia.shortfall, 5);
});
});
```
##### or an “expect” style:

<!-- Page 109 -->

```
describe('province', function() {
it('shortfall', function() {
const asia = new Province(sampleProvinceData());
expect(asia.shortfall).equal(5);
});
});
```
I usually prefer the assert style, but at the moment I mostly use the expect style while working in JavaScript.

Different environments provide different ways to run tests. When I’m programming in Java, I use an IDE that gives me a graphical test runner. Its progress bar is green as long as all the tests pass, and turns red should any of them fail. My colleagues often use the phrases “green bar” and “red bar” to describe the state of tests. I might say, “Never refactor on a red bar,” meaning you shouldn’t be refactoring if your test suite has a failing test. Or, I might say, “Revert to green” to say you should undo recent changes and go back to the last state where you had allpassing test suite (usually by going back to a recent versioncontrol checkpoint).

Graphical test runners are nice, but not essential. I usually have my tests set to run from a single key in Emacs, and observe the text feedback in my compilation window. The key point is that I can quickly see if my tests are all OK.

### ADD ANOTHER TEST

Now I’ll continue adding more tests. The style I follow is to look at all the things the class should do and test each one of them for any conditions that might cause the class to fail. This is not the same as testing every public method, which is what some programmers advocate. Testing should be riskdriven; remember, I’m trying to find bugs, now or in the future. Therefore I don’t test accessors that just read and write a field: They are so simple that I’m not likely to find a bug there.

This is important because trying to write too many tests usually leads to not writing enough. I get many benefits from testing even if I do only a little testing. My focus is to test the areas that I’m most worried about going wrong. That way I get the most benefit for my testing effort.

*It is better to write and run incomplete tests than not to run complete tests.*

So I’ll start by hitting the other main output for this code—the profit calculation. Again,

<!-- Page 110 -->

I’ll just do a basic test for profit on my initial fixture.
```
describe('province', function() {
it('shortfall', function() {
const asia = new Province(sampleProvinceData());
expect(asia.shortfall).equal(5);
});
it('profit', function() {
const asia = new Province(sampleProvinceData());
expect(asia.profit).equal(230);
});
});
```
That shows the final result, but the way I got it was by first setting the expected value to a placeholder, then replacing it with whatever the program produced (230). I could have calculated it by hand myself, but since the code is supposed to be working correctly, I’ll just trust it for now. Once I have that new test working correctly, I break it by altering the profit calculation with a spurious * 2. I satisfy myself that the test fails as it should, then revert my injected fault. This pattern—write with a placeholder for the expected value, replace the placeholder with the code’s actual value, inject a fault, revert the fault—is a common one I use when adding tests to existing code.

There is some duplication between these tests—both of them set up the fixture with the same first line. Just as I’m suspicious of duplicated code in regular code, I’m suspicious of it in test code, so will look to remove it by factoring to a common place. One option is to raise the constant to the outer scope.
```
describe('province', function() {
const asia = new Province(sampleProvinceData()); // DON'T DO THIS
it('shortfall', function() {
expect(asia.shortfall).equal(5);
});
it('profit', function() {
expect(asia.profit).equal(230);
});
});
```
But as the comment indicates, I never do this. It will work for the moment, but it introduces a petri dish that’s primed for one of the nastiest bugs in testing—a shared fixture which causes tests to interact. The const keyword in JavaScript only means the

<!-- Page 111 -->

reference to asia is constant, not the content of that object. Should a future test change that common object, I’ll end up with intermittent test failures due to tests interacting through the shared fixture, yielding different results depending on what order the tests are run in. That’s a nondeterminism in the tests that can lead to long and difficult debugging at best, and a collapse of confidence in the tests at worst. Instead, I prefer to do this:
```
describe('province', function() {
let asia;
beforeEach(function() {
asia = new Province(sampleProvinceData());
});
it('shortfall', function() {
expect(asia.shortfall).equal(5);
});
it('profit', function() {
expect(asia.profit).equal(230);
});
});
```
The beforeEach clause is run before each test runs, clearing out asia and setting it to a fresh value each time. This way I build a fresh fixture before each test is run, which keeps the tests isolated and prevents the nondeterminism that causes so much trouble.

When I give this advice, some people are concerned that building a fresh fixture every time will slow down the tests. Most of the time, it won’t be noticeable. If it is a problem, I’d consider a shared fixture, but then I will need to be really careful that no test ever changes it. I can also use a shared fixture if I’m sure it is truly immutable. But my reflex is to use a fresh fixture because the debugging cost of making a mistake with a shared fixture has bit me too often in the past.

Given I run the setup code in beforeEach with every test, why not leave the setup code inside the individual it blocks? I like my tests to all operate on a common bit of fixture, so I can become familiar with that standard fixture and see the various characteristics to test on it. The presence of the beforeEach block signals to the reader that I’m using a standard fixture. You can then look at all the tests within the scope of that describe block and know they all take the same base data as a starting point.

### MODIFYING THE FIXTURE

<!-- Page 112 -->

So far, the tests I’ve written show how I probe the properties of the fixture once I’ve loaded it. But in use, that fixture will be regularly updated by the users as they change values.

Most of the updates are simple setters, and I don’t usually bother to test those as there’s little chance they will be the source of a bug. But there is some complicated behavior around Producer’s production setter, so I think that’s worth a test.

*describe(’province’…*
```
it('change production', function() {
asia.producers[0].production = 20;
expect(asia.shortfall).equal(6);
expect(asia.profit).equal(292);
});
```
This is a common pattern. I take the initial standard fixture that’s set up by the beforeEach block, I exercise that fixture for the test, then I verify the fixture has done what I think it should have done. If you read much about testing, you’ll hear these phases described variously as setupexerciseverify, givenwhenthen, or arrangeact assert. Sometimes you’ll see all the steps present within the test itself, in other cases the common early phases can be pushed out into standard setup routines such as beforeEach.

(There is an implicit fourth phase that’s usually not mentioned: teardown. Teardown removes the fixture between tests so that different tests don’t interact with each other. By doing all my setup in beforeEach, I allow the test framework to implicitly tear down my fixture between tests, so I can take the teardown phase for granted. Most writers on tests gloss over teardown—reasonably so, since most of the time we ignore it. But occasionally, it can be important to have an explicit teardown operation, particularly if we have a fixture that we have to share between tests because it’s slow to create.)

In this test, I’m verifying two different characteristics in a single it clause. As a general rule, it’s wise to have only a single verify statement in each it clause. This is because the test will fail on the first verification failure—which can often hide useful information when you’re figuring out why a test is broken. In this case, I feel the two are closely enough connected that I’m happy to have them in the same test. Should I wish to separate them into separate it clauses, I can do that later.

### PROBING THE BOUNDARIES

<!-- Page 113 -->

So far my tests have focused on regular usage, often referred to as “happy path” conditions where everything is going OK and things are used as expected. But it’s also good to throw tests at the boundaries of these conditions—to see what happens when things might go wrong.

Whenever I have a collection of something, such as producers in this example, I like to see what happens when it’s empty.
```
describe('no producers', function() {
let noProducers;
beforeEach(function() {
const data = {
name: "No proudcers",
producers: [],
demand: 30,
price: 20
};
noProducers = new Province(data);
});
it('shortfall', function() {
expect(noProducers.shortfall).equal(30);
});
it('profit', function() {
expect(noProducers.profit).equal(0);
});
```
With numbers, zeros are good things to probe:

*describe(’province’…*
```
it('zero demand', function() {
asia.demand = 0;
expect(asia.shortfall).equal(25);
expect(asia.profit).equal(0);
});
```
##### as are negatives:

*describe(’province’…*

<!-- Page 114 -->

```
it('negative demand', function() {
asia.demand = 1;
expect(asia.shortfall).equal(26);
expect(asia.profit).equal(10);
});
```
At this point, I may start to wonder if a negative demand resulting in a negative profit really makes any sense for the domain. Shouldn’t the minimum demand be zero? In which case, perhaps, the setter should react differently to a negative argument—raising an error or setting the value to zero anyway. These are good questions to ask, and writing tests like this helps me think about how the code ought to react to boundary cases.

*Think of the boundary conditions under which things might go wrong and* *concentrate your tests there.*

The setters take a string from the fields in the UI, which are constrained to only accept numbers—but they can still be blank, so I should have tests that ensure the code responds to the blanks the way I want it to.

*describe(’province’…*
```
it('empty string demand', function() {
asia.demand = "";
expect(asia.shortfall).NaN;
expect(asia.profit).NaN;
});
```
Notice how I’m playing the part of an enemy to my code. I’m actively thinking about how I can break it. I find that state of mind to be both productive and fun. It indulges the meanspirited part of my psyche.

##### This one is interesting:
```
describe('string for producers', function() {
```

<!-- Page 115 -->

```
it('', function() {
const data = {
name: "String producers",
producers: "",
demand: 30,
price: 20
};
const prov = new Province(data);
expect(prov.shortfall).equal(0);
});
```
This doesn’t produce a simple failure reporting that the shortfall isn’t 0. Here’s the console output:
1) string for producers : TypeError: doc.producers.forEach is not a function at new Province (src/main.js:22:19) at Context.<anonymous> (src/tester.js:86:18)
```
’’’’’’’’’!
9 passing (74ms)
1 failing
```
Mocha treats this as a failure—but many testing frameworks distinguish between this situation, which they call an error, and a regular failure. A failure indicates a verify step where the actual value is outside the bounds expected by the verify statement. But this error is a different animal—it’s an exception raised during an earlier phase (in this case, the setup). This looks like an exception that the authors of the code hadn’t anticipated, so we get an error sadly familiar to JavaScript programmers (“… is not a function”).

How should the code respond to such a case? One approach is to add some handling that would give a better error response—either raising a more meaningful error message, or just setting producers to an empty array (with perhaps a log message). But there may also be valid reasons to leave it as it is. Perhaps the input object is produced by a trusted source—such as another part of the same code base. Putting in lots of validation checks between modules in the same code base can result in duplicate checks that cause more trouble than they are worth, especially if they duplicate validation done elsewhere. But if that input object is coming in from an external source, such as a JSONencoded request, then validation checks are needed, and should be tested. In either case, writing tests like this raises these kinds of questions.

<!-- Page 116 -->

If I’m writing tests like this before refactoring, I would probably discard this test. Refactoring should preserve observable behavior; an error like this is outside the bounds of observable, so I need not be concerned if my refactoring changes the code’s response to this condition.

If this error could lead to bad data running around the program, causing a failure that will be hard to debug, I might use *Introduce Assertion (302)* to fail fast. I don’t add tests to catch such assertion failures, as they are themselves a form of test.

*Don’t let the fear that testing can’t catch all bugs stop you from writing tests* *that catch most bugs.*

When do you stop? I’m sure you have heard many times that you cannot prove that a program has no bugs by testing. That’s true, but it does not affect the ability of testing to speed up programming. I’ve seen various proposed rules to ensure you have tested every combination of everything. It’s worth taking a look at these—but don’t let them get to you. There is a law of diminishing returns in testing, and there is the danger that by trying to write too many tests you become discouraged and end up not writing any. You should concentrate on where the risk is. Look at the code and see where it becomes complex. Look at a function and consider the likely areas of error. Your tests will not find every bug, but as you refactor, you will understand the program better and thus find more bugs. Although I always start refactoring with a test suite, I invariably add to it as I go along.

### MUCH MORE THAN THIS

That’s as far as I’m going to go with this chapter—after all, this is a book on refactoring, not on testing. But testing is an important topic, both because it’s a necessary foundation for refactoring and because it’s a valuable tool in its own right. While I’ve been happy to see the growth of refactoring as a programming practice since I wrote this book, I’ve been even happier to see the change in attitudes to testing. Previously seen as the responsibility of a separate (and inferior) group, testing is now increasingly a firstclass concern of any decent software developer. Architectures often are, rightly, judged on their testability.

The kinds of tests I’ve shown here are unit tests, designed to operate on a small area of the code and run fast. They are the backbone of selftesting code; most tests in such a system are unit tests. There are other kinds of tests too, focusing on integration between components, exercising multiple levels of the software together, looking for

<!-- Page 117 -->

performance issues, etc. (And even more varied than the types of tests are the arguments people get into about how to classify tests.)

Like most aspects of programming, testing is an iterative activity. Unless you are either very skilled or very lucky, you won’t get your tests right the first time. I find I’m constantly working on the test suite—just as much as I work on the main code. Naturally, this means adding new tests as I add new features, but it also involves looking at the existing tests. Are they clear enough? Do I need to refactor them so I can more easily understand what they are doing? Have I got the right tests? An important habit to get into is to respond to a bug by first writing a test that clearly reveals the bug. Only after I have the test do I fix the bug. By having the test, I know the bug will stay dead. I also think about that bug and its test: Does it give me clues to other gaps in the test suite?

*When you get a bug report, start by writing a unit test that exposes the bug.*

A common question is, “How much testing is enough?” There’s no good measurement for this. Some people advocate using test coverage [mftc] as a measure, but test coverage analysis is only good for identifying untested areas of the code, not for assessing the quality of a test suite.

The best measure for a good enough test suite is subjective: How confident are you that if someone introduces a defect into the code, some test will fail? This isn’t something that can be objectively analyzed, and it doesn’t account for false confidence, but the aim of selftesting code is to get that confidence. If I can refactor my code and be pretty sure that I’ve not introduced a bug because my tests come back green—then I can be happy that I have good enough tests.

It is possible to write too many tests. One sign of that is when I spend more time changing the tests than the code under test—and I feel the tests are slowing me down. But while overtesting does happen, it’s vanishingly rare compared to undertesting.
