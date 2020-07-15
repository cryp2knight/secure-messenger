let currentUser;

function signOut() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("signed out...");
      location.href = "././login.html";
    });
}

let btnAddFromEmail = document.getElementById("addFromEmail");

let txtEmail = document.getElementById("email");

btnAddFromEmail.addEventListener("click", (ev) => {
  let email = txtEmail.value.trim();
  if (email !== "") {
    let isFound;
    for (let user in users) {
      if (users[user].email == email) {
        if (!(user in containerContent.children)) {
          containerContent.insertAdjacentHTML(
            "beforeend",
            `
                          <div id="` +
              user +
              `" class="tabcontent">
              <div class='receiverProf'><center><img src='` +
              users[user].photo +
              `' class='avatar'><br>
            <strong>` +
              users[user].name +
              `</strong><br>
            <em>` +
              users[user].email +
              `</em></center>
            </div>
            <hr>
                          </div>
                      `
          );
          containerMessages.insertAdjacentHTML(
            "beforeend",
            '<button class="tablinks" onclick="openMessage(event, \'' +
              user +
              "')\"> " +
              '<div class="avname">' +
              '<img src="' +
              users[user].photo +
              '" alt="Avatar" class="avatar"></img>' +
              "<div><b>" +
              users[user].name +
              "</b></br>" +
              users[user].email +
              "</div></div>" +
              "</button>"
          );
        }
        txtEmail.value = "";
        isFound = true;
        break;
      }
    }
    if (!isFound) {
      alert(
        "user " +
          email +
          " not found. Pls ask your friend to sign in the platform."
      );
    }
  }
});

let btnSignout = document.getElementById("signout");
btnSignout.addEventListener("click", signOut);

let mypic = document.getElementById("mypic");
let myname = document.getElementById("myname");

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    console.log("user is logged in");
    mypic.src = user.photoURL;
    myname.innerText = user.displayName;
    currentUser = user;
    loadUsers();
    loadMessages();
  } else {
    location.href = "././login.html";
  }
});

let toggleContacts = document.getElementById("toggleContacts");

toggleContacts.addEventListener("click", function () {
  if (toggleContacts.checked) {
    containerMessages.style.display = "none";
  } else {
    containerMessages.style.display = "block";
  }
});

let containerMessages = document.getElementById("messages");
let containerChat = document.getElementById("chat");
let containerContent = document.getElementById("content");

function openMessage(evt, uid) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(uid).style.display = "block";
  evt.currentTarget.className += " active";
  receiverId = uid;
}

let users = {};

function loadUsers() {
  firebase
    .database()
    .ref("messages/users")
    .on("child_added", (snapshot) => {
      users[snapshot.key] = snapshot.val();
      if (snapshot.key == currentUser.uid) {
        if (!users[currentUser.uid].publicKey) {
          location.href = "././change_public_key.html";
        } else {
          myPublicKey = users[currentUser.uid].publicKey;
          document.getElementById("index").style.display = "block";
        }
      }
    }, er => {
      console.log(er)
    });
}

function loadMessages() {
  //uid is the people of whom youre chatting with
  let content = "";
  firebase
    .database()
    .ref("messages/messages/" + currentUser.uid + "/chats")
    .on("child_added", (snapshot) => {
      if (!(snapshot.key in containerContent.children)) {
        containerContent.insertAdjacentHTML(
          "beforeend",
          `
              <div id="` +
            snapshot.key +
            `" class="tabcontent">
            <div class='receiverProf'><center><img src='` +
            users[snapshot.key].photo +
            `' class='avatar'><br>
            <strong>` +
            users[snapshot.key].name +
            `</strong><br>
            <em>` +
            users[snapshot.key].email +
            `</em></center>
            </div>
            <hr>
              </div>
          `
        );
        containerMessages.insertAdjacentHTML(
          "beforeend",
          '<button class="tablinks" onclick="openMessage(event, \'' +
            snapshot.key +
            "')\"> " +
            '<div class="avname">' +
            '<img src="' +
            users[snapshot.key].photo +
            '" alt="Avatar" class="avatar"></img>' +
            "<div><b>" +
            users[snapshot.key].name +
            "</b></br>" +
            users[snapshot.key].email +
            "</div></div>" +
            "</button>"
        );
      }
      loadChat(snapshot.key);
    }, er =>{
      console.log(er)
    });
}

let receiverId;

var chats = {};

function msgClick(id) {
  if (id in chats) {
  } else {
    while (containerChat.firstChild) {
      containerChat.removeChild(containerChat.lastChild);
    }
    chats[id] = [];
    loadChat(id);
  }
  receiverId = id;
}

let prevId = "";

function loadChat(uid) {
  //uid is the people of whom youre chatting with
  let chat = document.getElementById(uid);
  firebase
    .database()
    .ref("messages/messages/" + currentUser.uid + "/chats/" + uid)
    .on("child_added", (snapshot) => {
      let d = snapshot.val();
      let a = "";
      let av = "";
      let decrypted;
      if (d.source === currentUser.uid) {
        a = " me";
        decrypted = escapeHTML(decrypt(d.message.sender, snapshot.key));
      } else {
        a = " you";
        decrypted = escapeHTML(decrypt(d.message.receiver, snapshot.key));
        av =
          `<td class="avyou"><img src="` +
          d.sourceData.photo +
          `" class="avatar"></td>`;
      }

      if (!decrypted) {
        decrypted = "<b><u>Cannot decrypt</u></b>";
      }

      let date = new Date(d.timestamp);
      chat.insertAdjacentHTML(
        "beforeend",
        `<div class='` +
          a +
          `'>
         <div>
         <table><tr>
         
         ` +
          av +
          `
         
         <td>
         <small>` +
          date.toDateString() +
          `</small>
          <div id='` +
          snapshot.key +
          `'>
      ` +
          decrypted +
          `
          </div></td></tr>
          </div>
      </div>`
      );

      document.location = "#" + snapshot.key;
    }, er => {
      console.log(er)
    });
}

var escape = document.createElement("textarea");
function escapeHTML(html) {
  escape.textContent = html;
  return escape.innerHTML;
}

let btnSendMessage = document.getElementById("send-message");
let txtMessage = document.getElementById("txt-message");

btnSendMessage.addEventListener("click", (ev) => {
  let message = txtMessage.value;
  if (txtMessage.value.trim() != "") {
    if (privateKey) {
      if (users[receiverId].publicKey) {
        sendMessage(receiverId, message);
      } else {
        alert(
          "sorry you cant send message to " +
            users[receiverId].email +
            ". Ask them to generate their keys first."
        );
      }
    } else {
      alert("pls provide a private key.");
    }
  }
});

function sendMessage(uid, msg) {
  let mm = encrypt(msg, users[uid].publicKey);
  if (mm) {
    let key = firebase
      .database()
      .ref("messages/messages/" + currentUser.uid + "/chats/" + uid)
      .push().key;
    let data = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      source: currentUser.uid,
      destination: uid,
      sourceData: {
        email: currentUser.email,
        photo: currentUser.photoURL,
        name: currentUser.displayName,
      },
      message: mm,
    };

    firebase
      .database()
      .ref("messages/messages/" + uid + "/chats/" + currentUser.uid + "/" + key)
      .set(data)
      .catch(er=> {
        console.log(er)
      })
    firebase
      .database()
      .ref("messages/messages/" + currentUser.uid + "/chats/" + uid + "/" + key)
      .set(data)
      .then(() => {
        txtMessage.value = "";
      })
      .catch(er=> {
        console.log(er)
      })
  } else {
    console.error(
      "Cannot send message. It might be too long for our encryption algorithm."
    );
    alert(
      "Cannot send message. It might be too long for our encryption algorithm."
    );
  }
}
let drpContent = document.getElementById("drp-content");
let toggle = true;
mypic.addEventListener("click", function () {
  if (toggle) {
    drpContent.style.display = "block";
    toggle = false;
  } else {
    drpContent.style.display = "none";
    toggle = true;
  }
});

window.onclick = (ev) => {
  if (!event.target.matches("#mypic")) {
    drpContent.style.display = "none";
    toggle = true;
  }
};

//encryption
var crypt = new JSEncrypt();
var privKeyFile = document.getElementById("private-key");
let privateKey;
let pkey = document.getElementById("pkey");

privKeyFile.addEventListener("change", (event) => {
  var file = privKeyFile.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      crypt.setPrivateKey(e.target.result);
      crypt.getPrivateKey();
      privateKey = e.target.result;
      pkey.value = e.target.result;
      decryptAgain();
    } catch (err) {
      alert("Invalid private key!");
    }
  };
  reader.readAsText(file);
});

pkey.addEventListener("change", (ev) => {
  if (pkey.value.trim() !== "") {
    try {
      crypt.setPrivateKey(pkey.value);
      crypt.getPrivateKey();
      privateKey = pkey.value;
      decryptAgain();
    } catch (err) {
      alert("Invalid private key!");
    }
  }
});

let myPublicKey;

unencrypted = {};

function decrypt(txt, id) {
  let a = crypt.decrypt(txt);
  if (!a) {
    unencrypted[id] = txt;
    return null;
  } else return crypt.decrypt(txt);
}

function decryptAgain() {
  for (let key in unencrypted) {
    try {
      let bb = decrypt(unencrypted[key], key);
      if (bb) {
        document.getElementById(key).innerText = bb;
        delete unencrypted[key];
      }
    } catch (er) {
      console.log(er.message);
    }
  }
}

let encrypt = function (txt, theirPublicKey) {
  // encrypts the outgoing message for using their pub key and my pubkey
  // returns a json of encrypted messages that contains copy for them and me
  let data = {};
  data.receiver = singleEncrypt(txt, theirPublicKey);
  data.sender = crypt.encrypt(txt);
  if (data.receiver && data.sender) {
    return data;
  }
  return null;
};

function singleEncrypt(txt, pk) {
  let them = new JSEncrypt();
  them.setPublicKey(pk);
  return them.encrypt(txt);
}
