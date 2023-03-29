import { Terminal } from "xterm";
var term = new Terminal;
term.open(document.getElementById("terminal"));
console.log(document.getElementById("terminal"));
term.writeln("Hello World!!!");
 