# Hoare Logic Proof Checker

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
<br>
<img src="https://img.shields.io/badge/License: MIT-green?style=for-the-badge" />

The Hoare Logic Proof Checker is a web-based proof kernel for determining the validity of a Hoare Triple with a given proof body. 

Developed using React + TypeScript and built with Vite, the tool uses Microsoft's Z3 SMT solver via the Z3 WebAssembly module on the client-side. This is perfomed by utilising TS bindings supplied by the z3-solver npm package

## About

The aim of the tool is to act as an easily accessible teaching aid in the delivery of formal logic courses covering program validation using the Hoare Logic proof system, providing instant feedback on whether a students proof is valid or invalid. 
By using such tooling in a classroom setting, students can receive feedback and verify/develop their understanding more quickly than reliance on solely pen and paper exerises can provide.



### Supported Proof Laws and Format

At current, the tool supports validation of Hoare Logic Proofs using the Assignment Law and Skip Law respectively, this is via a 'backwards logic' as employed in [CITE PROOF STYLE] An example of which is shown below:

[PROOF FORMAT EXAMPLE HERE]

As can be seen in the example above, the proof format is adapted from the [CITE PROOF STYLE] proof style and has a syntax ...., this is inspired by the proof line syntax of the Carnap system



## How to Use



## Technical Specification