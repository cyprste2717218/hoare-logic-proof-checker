# Hoare Logic Proof Checker

<div style="display: flex justify-content: center">
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/License: MIT-green?style=for-the-badge" />
<div>
<br><br>
<img src="image\Landing Page.png" />
<br><br>
The Hoare Logic Proof Checker is a web-based proof kernel for determining the validity of a Hoare Triple with a given proof body. 

Developed using React + TypeScript and built with Vite, the tool uses [Microsoft's Z3 SMT solver](https://github.com/Z3Prover/z3) via the Z3 WASM module on the client-side. This is perfomed by utilising TS bindings supplied by the [z3-solver npm package](https://www.npmjs.com/package/z3-solver).

The latest release of the tool is currently deployed through vercel at the following url: <br>
https://hoare-logic-proof-checker.vercel.app/

## About

The aim of the tool is to act as an easily accessible teaching aid in the delivery of formal logic courses covering program validation using the [Hoare Logic proof system](https://en.wikipedia.org/wiki/Hoare_logic), providing instant feedback on whether a students proof is valid or invalid. 
By using such tooling in a classroom setting, students can receive feedback and verify/develop their understanding more quickly than reliance on solely pen and paper exerises can provide.<br>
The tooling was developed in the completion of my thesis for my BEng in Computer Science, this [paper can be read here](dissertation.pdf)


### Supported Proof Laws and Format

At current, the tool supports validation of Hoare Logic Proofs using the Assignment Law and Skip Law respectively, this is via a 'fitch-style' notation, as inspired by proof construction within the [Carnap System tooling](https://github.com/Carnap/Carnap). <br><br>
An example of a proof under this format for verifying a Hoare triple under the Assignment Law is shown below:

```
1	x=1 -> x+2 = 3 :arith
2	x=1 -> (x=3)[x |> x+2] :subst 1
3   {x=1} x:=x+2 {x=3} :hassign 2
```

Each proof line is annotated with a suffix indicating the 'rule', either an axiom of the Hoare logic system (starting with the letter 'h', e.g. 'hassign' for the assignment axiom) or a construct which helps show the way in which a Hoare logic axiom provides validation for the Hoare triple. 
<br><br>
Additionally, each suffix is followed by a brief list of numbers, which refer to line numbers of proof statements which support the rule.
<br>
In the above example, suffix `:hassign 2` on line 3 is stating that the content on this line provides sufficient proof for the triple under the Assignment law axiom, due to the valid supporting subtitution shown on line 2.
<br><br>
The syntax of all rules which exist are detailed in the <b>'Reference Guide'</b> section, accessible from the app's sidebar.

## How to Use



## Technical Specification