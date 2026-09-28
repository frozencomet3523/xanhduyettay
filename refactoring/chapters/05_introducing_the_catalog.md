# Chapter 5: Introducing the Catalog

> **Pages:** 118 – 120
> **Summary:** How the refactoring catalog is organized: the standard five-part entry format (name, sketch/aliases, motivation, mechanics, examples) and the choice of refactorings included.

---

## Chapter 5 Introducing the Catalog

The rest of this book is a catalog of refactorings. This catalog started from my personal notes that I made to remind myself how to do refactorings in a safe and efficient way. Since then, I’ve refined the catalog, and there’s more of it that comes from deliberate exploration of some refactoring moves. It’s still something I use when I do a refactoring I haven’t done in a while.

### FORMAT OF THE REFACTORINGS

As I describe the refactorings in the catalog, I use a standard format. Each refactoring has five parts, as follows:

I begin with a name. The name is important to building a vocabulary of refactorings. This is the name I use elsewhere in the book. Refactorings often go by different names now, so I also list any aliases that seem to be common.

I follow the name with a short sketch of the refactoring. This helps you find a refactoring more quickly.

The motivation describes why the refactoring should be done and describes circumstances in which it shouldn’t be done.

The mechanics are a concise, stepbystep description of how to carry out the refactoring.

The examples show a very simple use of the refactoring to illustrate how it works.

The sketch shows a code example of the transformation of the refactoring. It’s not meant to explain what the refactoring is, let alone how to do it, but it should remind you what the refactoring is if you’ve come across it before. If not, you’ll probably need to work through the example to get a better idea. I also include a small graphic; again, I don’t intend it to be explanatory—it’s more of a graphic memoryjogger.

<!-- Page 119 -->

The mechanics come from my own notes to remember how to do the refactoring when I haven’t done it for a while. As such, they are somewhat terse, usually without explanations of why the steps are done that way. I give a more expansive explanation in the example. This way, the mechanics are short notes you can refer to easily when you know the refactoring but need to look up the steps (at least this is how I use them). You’ll probably need to read the examples when you first do the refactoring.

I’ve written the mechanics in such a way that each step of each refactoring is as small as possible. I emphasize the safe way of doing the refactoring—which is to take very small steps and test after every one. At work, I usually take larger steps than some of the baby steps described, but if I run into a bug, I back out the last step and take the smaller steps. The steps include a number of references to special cases. The steps thus also function as a checklist; I often forget these things myself.

Although I (with few exceptions) only list one set of mechanics, they aren’t the only way to carry out the refactoring. I selected the mechanics in the book because they work pretty well most of the time. It’s likely you’ll vary them as you get more practice in refactoring, and that’s fine. Just remember that the key is to take small steps—and the trickier the situation, the smaller the steps.

The examples are of the laughably simple textbook kind. My aim with the examples is to help explain the basic refactoring with minimal distractions, so I hope you’ll forgive the simplicity. (They are certainly not examples of good business modeling.) I’m sure you’ll be able to apply them to your rather more complex situations. Some very simple refactorings don’t have examples because I didn’t think an example would add much.

In particular, remember that the examples are included only to illustrate the one refactoring under discussion. In most cases, there are still problems with the code at the end—but fixing these problems requires other refactorings. In a few cases in which refactorings often go together, I carry examples from one refactoring to another. In most cases, I leave the code as it is after the single refactoring. I do this to make each refactoring selfcontained, because the primary role of the catalog is to be a reference.

I use color to highlight changed code where it may be difficult to spot among code that has not been changed. I do not use highlighting for all changed code, because too much defeats the purpose.

### THE CHOICE OF REFACTORINGS

This is by no means a complete catalog of refactorings. It is, I hope, a collection of those most useful to have them written down. By “most useful” I mean those that are both

<!-- Page 120 -->

commonly used and worthwhile to name and describe. I find something worthwhile to describe for a combination of reasons: Some have interesting mechanics which help general refactoring skills, some have a strong effect on improving the design of code.

Some refactorings are missing because they are so small and straightforward that I don’t feel they are worth writing up. An example in the first edition was *Slide* *Statements (223)*—which I use frequently but didn’t recognize as something I should include in the catalog (obviously, I changed my mind for this edition). These may well get added to the book over time, depending on how much energy I devote to new refactorings in the future.

Another category is refactorings that logically exist, but either aren’t used much by me or show a simple similarity to other refactorings. Every refactoring in this book has a logical inverse refactoring, but I didn’t write all of them up because I don’t find many inverses interesting. *Encapsulate Variable (132)* is a common and powerful refactoring but its inverse is something I hardly ever do (and it is easy to perform anyway) so I didn’t think we need a catalog entry for it.
