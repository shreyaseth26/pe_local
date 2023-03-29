import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import axios from 'axios';
import {Terminal} from 'xterm'
import {io} from 'socket.io-client'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  // socket=io('http://localhost:3000');

  editorOptions = {theme: 'vs-dark', language: 'cpp',renderIndentGuides: false, tabSize:4,wordwrap:false};
  code!:string;
  ip!:string;
  originalCode: string = 'function x() { // TODO }';
  urls:any;
  data:any;
  file:any;
  default:any;
  term = new Terminal();


  title(title: any) {
    throw new Error('Method not implemented.');
  }

  async ngOnInit(): Promise<void> {
    try{
      this.getDefaultCode()
    }
    catch(error){
      console.log(error);
    }
    // this.getURLS()
    // this.getCode()
    // this.socket.on("connect",()=>{
    //   console.log(`You connected with id:${this.socket.id}`)
    // })
    
  }


  getDefaultCode(){
    console.log("Inside Def Code Function")
    // this.socket.emit("get-default-code")
    // this.socket.on("this-is-default-code", code => {
    //   this.code = code;
    // })
   

  }
  
    onInit(edit: { getPosition: () => any; }) {
      const line = edit.getPosition();
    }
    ChangeTheme(){
      this.editorOptions={theme:'vs-light',language:'java',renderIndentGuides: true,tabSize:10,wordwrap:true};
    }
    Save(){
      
      let updateData=this.code;
      console.log(updateData);
      // this.socket.emit('save-event',updateData)
        axios.post("http://localhost:3000/save",{ code:updateData}
           
      ).then(
        res=>{
         console.log(res);
        }
     )
    }

    finalResult: any;

    async compile(){
      // this.term = new Terminal();
      //  this.term.open(document.getElementById("terminal")!);
      //  this.socket.emit('custom-event',this.code);
      //  this.finalResult="";
      //  this.socket.on("code-output", output=>{
      //   this.finalResult=output;
      //   this.term.write(output);
      //  })

      //  this.term.onKey(e=>{
      //   if(KeyboardEvent){
      //     this.term.write(e.key);
      //   }

      //   if(e.key=='/r')
      //   this.term.write('/n');
      //   this.socket.emit('send-input',e.key)
      //  })
    
      // if(typeof(inputdata)=='undefined'){
      //   this.finalResult="Enter the values";
      // }
      let inputdata=this.ip;
     let input=String(inputdata);
      
      console.log(typeof(input));
     const data= await axios.post("http://localhost:3000/compile",{inputs:input});
     console.log(inputdata);
     
      this.finalResult = data.data;
       
      
    }
    
    
    // Reset(){
    //   window.location.reload();
    //   let updateData="//Set to defaulttttttt"
    //   axios.post("http://localhost:3001/save", {code :updateData}).then(
    //     res=>{
    //       console.log(res);
    //     }
    //   )
    // }
    
    
}