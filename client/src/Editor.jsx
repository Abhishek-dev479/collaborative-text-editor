import react,{useCallback, useEffect, useRef, useState} from 'react';
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import { io } from 'socket.io-client';
import {useParams, useLocation} from 'react-router-dom';
import Dialog from './Dialog';
import save from './save.png';
import Sidebar from './Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'

// function Editor(props){
//     let [socket, setSocket] = useState();
//     let [quill, setQuill] = useState();
//     let [dialog, setDialog] = useState([false, true]);
//     let {id} = useParams();
//     let [sidebar, setSidebar] = useState(false);
//     let [url, setUrl] = useState('http://localhost:3000'+useLocation().pathname);

//     // let newSocket = '';
//     useEffect(() => {
//         console.log('hello00000000000000000000000');
//         const newSocket = io.connect('http://localhost:3001');
//         console.log('hello');
//         newSocket.on('connect', () => {
//             console.log('id: '+newSocket.id);
//             setSocket(newSocket);
//             // console.log(socket.id);
//             f(newSocket);
//         })
//         return () => {
//             console.log('socket disconnected');
//             newSocket.disconnect();
//         }
//     }, [])
    
//     let f = useCallback((socket) => {
//         if(socket == null || quill == null) return;
//         console.log('hoooallaldlfajdafd29222');
//         if(id) socket.emit('document-id', id);
//         // let intervalId = setInterval(saveDocument, 5000);

//         socket.once('get-document', document => {
//             quill.setContents(document);
//         })
//         // if(socket == null || quill == null) return;
//         let handler = (data, oldData, source) => {
//             console.log('new data emiitting to server..');
//             if(source == 'user'){
//                 socket.emit('change', data);
//             }
//         }
//         quill.on('text-change', handler);

//         let socketHandler = (data) => {
//             quill.updateContents(data);
//         }
//         socket.on('change', socketHandler);

//         return () => {
//             // clearInterval(intervalId);
//             quill.off('text-change', handler);
//             socket.off('change', socketHandler);
//         }
//     }, [socket, quill, id]);


//         var toolbarOptions = [
//             ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
//             ['blockquote', 'code-block'],
//             [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//             [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
//             [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
//             [{ 'direction': 'rtl' }],                         // text direction
//             [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
//             [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
//             [{ 'font': [] }],
//             [{ 'align': [] }],
//             ['clean']                                         // remove formatting button
//           ];
    
//         const wrapperRef = useCallback((wrapper) => {
//             if(wrapper == null) return;
//             wrapper.innerHTML = "";
//             let editor = document.createElement('div');
//             wrapper.append(editor);
//             console.log('Quill editor establishing...');
//             quill = new Quill(editor, {theme: 'snow', modules:{toolbar: toolbarOptions}});
//             let k = document.getElementsByClassName('ql-toolbar')[0];
//             let img = createImage();
//             k.append(img);
//             let button = createButton();
//             k.append(button)
//         }, [])

//         function createButton(){
//             let div =  document.createElement('button');
//             div.classList.add('ql-formats');
//             div.textContent = 'Share'
//             div.setAttribute('id', 'but');
//             div.addEventListener('click', () => {
//                 setDialog([true, true]);
//                 saveDocument();
//             })
//             return div;
//         }
    
//         function createImage(){
//             let img = document.createElement('img');
//             img.setAttribute('src', '/save.png');
//             img.setAttribute('id', 'img-save');
//             img.classList.add('ql-formats'); 
//             img.addEventListener('click', () => {
//                 saveDocument();
//             })
//             return img;
//         }
    
//         function saveDocument(){
//             if(socket == null) console.log('still null');
//             console.log('saving docs.....');
//             let content = quill.getContents();
//             socket.emit('save-document', content);
//             socket.on('save-new-document', () => {
//                 setDialog([true, false]);
//             })
//         }
    
    
//         function removeDialog(){
//             setDialog([false, true]);
//         }
    
    
//         function closeSidebar(){
//             setSidebar(false);
//         }
    
//         function openSidebar(){
//             setSidebar(true)
//         }

//         function setFileName(filename){
//             if(socket == null){ console.log('socket not connected!'); return;}
//             socket.emit('new-document-name', filename);
//         }

//     return(
//         <div>
//         {socket ? <div>
//             <h1>{socket.id}</h1>
//             <div id='container' ref={wrapperRef}></div>
//             {dialog[0] && <Dialog share={dialog[1]} url={url} removeDialog={removeDialog} setFileName={setFileName}></Dialog>}
//             {sidebar && <Sidebar closeSidebar={closeSidebar} loggedIn={props.loggedIn}></Sidebar>}
//             {sidebar || <FontAwesomeIcon icon={faBars} onClick={openSidebar}  id='sidebar-toggle' />}
//             {/* <divonClick={openSidebar}></div> */}
//         </div> : <div>Loading...</div>}
//         </div>
//         // <div>
//         //     hello
//         // </div>
//     )
// }

// export default Editor;


// import { useCallback, useEffect, useState } from "react"
// import Quill from "quill"
// import "quill/dist/quill.snow.css"
// import { io } from "socket.io-client"
// import { useParams } from "react-router-dom"

const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]

export default function Editor() {
  const { id: documentId } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  let [dialog, setDialog] = useState([false, true]);
  let [url, setUrl] = useState('http://localhost:3000'+useLocation().pathname);
  let [save, setSave] = useState(true);
  let [sidebar, setSidebar] = useState(true);

  useEffect(() => {
    const s = io("http://localhost:3001")
    setSocket(s)
    return () => {
      s.disconnect()
    }
  }, [])

//   console.log(socket.id);

  useEffect(() => {
    if (socket == null || quill == null) return

    socket.once("load-document", document => {
      quill.setContents(document)
      // quill.enable()
    })

    socket.emit("get-document", documentId)
  }, [socket, quill, documentId])

  useEffect(() => {
    if (socket == null || quill == null) return
    console.log('save button clicked again');
    // const interval = setInterval(() => {
    socket.emit("save-document", quill.getContents());
    // }, SAVE_INTERVAL_MS)

    return () => {
      // clearInterval(interval)
    }
  }, [save])

  useEffect(() => {
    if (socket == null || quill == null) return

    // console.log('hello connected....');
    const handler = delta => {
      quill.updateContents(delta)
    }
    socket.on("receive-changes", handler)

    return () => {
      socket.off("receive-changes", handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return
      socket.emit("send-changes", delta)
    }
    quill.on("text-change", handler)

    return () => {
      quill.off("text-change", handler)
    }
  }, [socket, quill])

  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return

    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    })
    // q.disable()
    // q.setText("Loading...")
    setQuill(q)

    let k = document.getElementsByClassName('ql-toolbar')[0]; 
    let img = createImage();
    k.append(img);
    let button = createButton();
    k.append(button)
  }, [])

  function createButton(){
    let div =  document.createElement('button');
    div.classList.add('ql-formats');
    div.textContent = 'Share'
    div.setAttribute('id', 'but');
    div.addEventListener('click', () => {
        console.log('share clicked');
        setDialog([true, true]);
        saveDocument();
    })
    return div;
  }

  function saveDocument(){
      // if(socket == null) console.log('still null');
      console.log('saving docs.....');
      // let content = quill.getContents();
      // socket.emit('save-document', content);
      // socket.on('save-new-document', () => {
      //     setDialog([true, false]);
      // })
      setSave((prev)=>{
        return !prev;
      })
      // console.log(save);
  }

  function createImage(){
      console.log('save image created');
      let img = document.createElement('img');
      img.setAttribute('src', '/save.png');
      img.setAttribute('id', 'img-save');
      img.classList.add('ql-formats'); 
      img.addEventListener('click', () => {
          console.log('save image clicked');
          saveDocument();
      })
      return img;
  }

  function removeDialog(){
    setDialog([false, true]);
  }

  function closeSidebar(){
      setSidebar(false);
  }

  function openSidebar(){
      setSidebar(true)
  }

  useEffect(() => {
    console.log(save);
  }, [save]);

  return (
  <div id="container" ref={wrapperRef}>
      <div>{dialog[0] && <Dialog share={dialog[1]} url={url} removeDialog={removeDialog}></Dialog>}</div>
      {/* <div>{sidebar ? <Sidebar closeSidebar={closeSidebar} loggedIn={false}></Sidebar> : <FontAwesomeIcon icon={faBars} onClick={openSidebar}  id='sidebar-toggle' />}</div> */}
  </div>
  )
}
