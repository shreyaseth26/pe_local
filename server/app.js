const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const fs = require('fs')
const axios = require('axios')
const cors = require('cors')
const {exec,spawn, spawnSync} = require ('child_process')
const { stderr } = require('process')
const os = require("os");
const pty = require("node-pty")
const options = {stats:true};
var path = require('path');
var extention;
const rubric = require("./rubric.json")
const rubricresult= require("./rubricresult.json")

// const io = require('socket.io')(3000,{
//     cors:
//         {
//             origin:["http://localhost:4200"],
//         }
// });
app.use(cors({
    credentials:true,
    origin:"http://localhost:4200"
}))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))

// // compiler.init(options);
// var shell = os.platform() === "win32" ? "powershell.exe" : "bash";

// var ptyProcess = pty.spawn(shell, [] , {
//     name:"xterm-color",
//     cols:80,
//     row:24,
//     cwd:"assets/files",
//     env:process.env
// })
// io.on('connection' , socket => {

//     console.log(socket.id);
//     ptyProcess.on ("data", (output)=> {
//         socket.emit("code-output", output);
//       });

//     socket.on('custom-event', (code)=>{
//         // const file =fs.readFileSync("assets/files/test1.cpp", 'utf-8' );
//          extention = path.extname("assets/files/testjava.java");
//         console.log(extention);

//         if(extention==".cpp"){
//             ptyProcess.write("g++ test1.cpp; ./a.exe\r ");
//         }
//         else{
//             ptyProcess.write("java testjava.java; ./javatest.class\r");
//         }
        
//     })
//     socket.on("send-input", (data)=>{
//         ptyProcess.write(data);

//     })
//     socket.on("save-event",(code)=>{
//         if(extention==".cpp"){
//             fs.writeFileSync("assets/files/test1.cpp",code)
//         }
//         else{
//             fs.writeFileSync("assets/files/testjava.java",code)
//         }
       
//     })

//     socket.on("get-default-code", () =>{
//         if(extention=="cpp"){
//             fs.readFile("assets/files/test1.cpp", 'utf-8', function (err, data){
//                 socket.emit("this-is-default-code", data)
//             })
//         }
//         else{
//             fs.readFile("assets/files/testjava.java", 'utf-8', function (err, data){
//                 socket.emit("this-is-default-code", data)
//             })
//         }
       
//     })
//     // setTimeout(()=>{
//     //     ptyProcess.write('test1.cpp');
//     //     setTimeout(()=>{
//     //         ptyProcess.kill(),3000
//     //     })
//     // },3000)

// })

fileURLS = {
    "name":"test1.cpp",
    "url":"src/assets/files/test1.cpp"
}

app.post('/posts',(req,res)=>{
    req.body.data = fileURLS
    res.send(req.body.data)
})

app.get("/",async(req,response)=>{
    await axios.get('http://localhost:3000/posts').then(
        res=>{
            let file = fs.readFileSync(res.data[0].url)
            response.send(String(file))
        }
    )
})

 app.post("/save",(req,res)=>{
    let code=req.body.code;
    fs.writeFile("assets/files/test1.cpp",code,function(err){
        if(err){
            console.log(err);
        }
        console.log("success")
    })

       res.send(code);

})



app.get("/", (req, res) => {
    res.sendFile("assets/files" + "/index.html");
  });


  app.post("/compile",(req,res)=>{
    var op;
    var error;
     ip=req.body.inputs;
    //  compileWithoutInputs(ip);
    var child;
    var cmd = ("g++ assets/files/test1.cpp")
    child = exec(cmd, (err,stdout,stderr)=>{
        
        if(err){
       
            res.send(err)
           
        }
        else if(stderr)
        {
        
            res.send(stderr)
        }
        else{
           res.send("Compiled");
            console.log("File compiled!") 

        }
    })
});
 
app.post("/run",(req,res)=>{
    const ip="5 6";
    let output = "";
    let errors = "";
    const run = spawn("./a.exe");
  
    run.stdin.write(ip)
    run.stdin.end();
  
    run.stdout.on('data',(result)=>{
        output += result;
    })
  
    run.stderr.on('data',(error)=>{
        errors += error;
    })
  
    run.on('close', (code) => {
        if(code==1){
            return res.send(errors);
        }
        return res.send(output);
    });
});

app.post("/check", (req, res) => {
    let testcase = rubric.criteria.blackboxtests;
    let results = [];
    
   
    const runTest = (input) => {
      
      return new Promise((resolve, reject) => {
        const run = spawn("./a.exe");
  
        let output = "";
        let errors = "";
  
        run.stdin.write(input);
        run.stdin.end();
  
        run.stdout.on("data", (data) => {
          output += data;
        });
  
        run.stderr.on("data", (data) => {
          errors += data;
        });
  
        run.on("exit", (code) => {
          if (code === 0) {
          
            resolve({ output, errors });
          } else {
            reject(errors);
          }
        });
      });
    };
  
    const runAllTests = async () => {
        let jsonRes=[];
      for (let i = 0; i < testcase.length; i++) {
        const { input, output } = testcase[i].rule;
          const result = await runTest(input);
          
          
          if (result.output.trim() === output.trim()) {
            results.push({ passed: true, message: "Test passed" });
            jsonRes.push({ passed: true, message: "Test passed" })
            
            
          } 
          else if(result.output.trim()!= output.trim()){
            results.push({
              passed: false,
              message: `Test failed. Expected: ${output.trim()}. Actual: ${result.output.trim()}`,
            });
            jsonRes.push({
                passed: false,
                message: `Test failed. Expected: ${output.trim()}. Actual: ${result.output.trim()}`,
                
              })
            
          
        } 
        else{
          results.push({ passed: false, message: error });
        }
        
      }
      await writeFile(jsonRes).then(res.send("sucess!"));
      res.send(results);
    };
  
    function writeFile(jres){
        return new Promise(function (resolve, reject) {
            fs.writeFile("rubricresult.json", "", function () {
              resolve("done");
            });
            fs.appendFile("rubricresult.json", JSON.stringify(jres), (err) => {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                resolve("done");
              }
            });
          });
    }
    runAllTests();
  });
  

// app.post("/check",(req,res)=>{
//     let output = "";
//     let errors = "";
    
//     const testcase=rubric.criteria.blackboxtests
//     for(let i=0;i<testcase.length;i++){
//         // console.log(testcase[i].rule.input);
//         const run = spawn("./a.exe");
//         run.stdin.write(testcase[i].rule.input);
//         run.stdin.end();
//         run.stdout.on('data',(result)=>{
//             output += result;
//         })
//         run.stderr.on('data',(error)=>{
//             errors += error;
//         })
//         run.on('close', (code) => {
//             if(code==1){
//                 return res.send(errors);
//             }
//             return res.send(output);
//         });
//         // console.log(testcase[i].rule.output);
    
//     }
    
// })


app.listen(3000, ()=>{
    console.log("Listening");
})

//   io.on("compile", (socket) => {
//     console.log("Client Connected");
//     let ptyProcess = pty.spawn(shell, [], {
//       cwd: "assets/files",
//       env: process.env,
//     });
  
//     socket.on("start", (data) => {
//       ptyProcess.on("data", function (output) {
//         socket.emit("output", output);
//       });
//       ptyProcess.write("./a.out\r");
//     });
//     socket.on("input", (data) => {
//       ptyProcess.write(data);
//       ptyProcess.write('\r');
//     });
//   });

// function compileWithoutInputs(){
//     const options = {
//         cwd:process.cwd(),
//         end:process.env,
//         stdio:'inherit',
//         encoding:'utf-8'
//     }
     
//     var child;
//     var cmd = ("g++ assets/files/test1.cpp")
//     child = exec(cmd, (err,stdout,stderr)=>{
        
//         if(err){
//             console.log("err")
//             console.log(err)
//             res.send(err)
           
//         }
//         else if(stderr)
//         {
//             console.log("stdeer")
//             res.send(stderr)
//         }
//         else{
//             console.log("File compiled!")
//             const run= spawn("a.exe",options);  
//         }
//     })
// }

// function compileWithInputs(req,res){
   
//     var child;
//     var cmd = ("g++ assets/files/test1.cpp")
//     child = exec(cmd, (err,stdout,stderr)=>{
        
//         if(err){
       
//             res.send(err)
           
//         }
//         else if(stderr)
//         {
        
//             res.send(stderr)
//         }
//         else{
//            res.send("Compiled");
//             console.log("File compiled!") 

//         }
//     })



   
//     // run.stdout.on("data",(data)=>{
//     //     var output = data.toString()
//     //     // res.send(output)
//     //     console.log("output = ",output)
//     //     // res.setHeader("Output",output)
//     //     op=output;

//     // })
   
// }

    //  if(ip == 'undefined' || ip == "")
    //  {
        
    //     console.log("without")
    //     compileWithoutInputs()
    //  }
    //  else
    //  {
        
    //     console.log("with")
    //     compileWithInputs(ip)
    //  }
    
     
    
//     console.log(error);
       
       
//    process.stdin.on('data',data=>{
//         console.log(`you typed ${data.toString}`);
//         process.exit();
        
//     })
//     // run.stdin.write(ip)
//     // run.stdin.end();
    
   
    // run.stdout.on("data",(data,stdout)=>{
    //     var output = data.toString()
    //     // res.send(output)
    //     console.log(output)
    //     res.setHeader("Output",output)
    //     op=output;

    // })

//     run.on('exit',(code)=>{
//         if(typeof(error)=='undefined')
//       { 
//         res.send(op);
//         }
//         else{
//             res.send(error);
//         }
        
//         console.log("Code exited with code: ",code)
//     })
    
    
    // exec("gcc assets/files/test1.cpp -lstdc++ && a.exe",(error,stdout,stdeer)=>{
    //     if(error){
    //         console.log(`error:${error.message}`);
    //         return;
    //     }
    //     if(stdeer){
    //         console.log(`stdeer:${stdeer}`);
    //         return;
    //     }
    //     console.log(stdout);
    //     res.send(stdout);
    // })    






