// INITIALIZATION
let userName = null;
let userNameObject = {};

let userNameInputPromisse = null;

function login (event) {
    if (event.key === "Enter" || event.key === undefined) {
        userName = document.querySelector(".loginScreen input").value;
        userNameObject = {name: userName};

        userNameInputPromisse = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", userNameObject);

        const userNameInput = document.querySelector(".loginScreen input");
        userNameInput.classList.add("hidden");
        const loginButton = document.querySelector(".loginScreen button");
        loginButton.classList.add("hidden");
        const loadingGif = document.querySelector(".loadingGif");
        loadingGif.classList.remove("hidden");
        const loadingText = document.querySelector(".loginScreen p");
        loadingText.classList.remove("hidden");
        const userNameNotAvailableWarning = document.querySelector(".loginScreen span");
        userNameNotAvailableWarning.classList.add("hidden");

        userNameInputPromisse.then(userNameAvailable);
        userNameInputPromisse.catch(userNameNotAvailable);
    }
}

function userNameNotAvailable () {
    const userNameInput = document.querySelector(".loginScreen input");
    userNameInput.classList.remove("hidden");

    const loginButton = document.querySelector(".loginScreen button");
    loginButton.classList.remove("hidden");

    const loadingGif = document.querySelector(".loadingGif");
    loadingGif.classList.add("hidden");

    const loadingText = document.querySelector(".loginScreen p");
    loadingText.classList.add("hidden");

    const userNameNotAvailableWarning = document.querySelector(".loginScreen span");
    userNameNotAvailableWarning.classList.remove("hidden");

    document.querySelector(".loginScreen input").value = "";
}

function statusUpdater () {
    const stayOnline = axios.post("https://mock-api.driven.com.br/api/v4/uol/status", userNameObject);
    stayOnline.catch(couldntSendMessage);
}

function userNameAvailable (serverAnswer) {
    const loginScreen = document.querySelector(".loginScreen");
    loginScreen.classList.add("hidden");

    const threeSeconds = 3000;
    const fiveSeconds = 5000;
    setInterval(getServerMessages, threeSeconds); 
    setInterval(statusUpdater, fiveSeconds);
}

function getServerMessages () {
    let getMessagesPromisse = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
    getMessagesPromisse.then(serverAnswerProcessor);
}

function serverAnswerProcessor (serverAnswer) {
    const messagesObject = serverAnswer.data;
    document.querySelector(".messages").innerHTML = "";
    messagesObject.forEach(messageRenderer);
}

function messageRenderer (message) {
    const messagesSection = document.querySelector(".messages");
    if (message.type === "status") {
        messagesSection.innerHTML = messagesSection.innerHTML + 
        `<article class="statusMessage" data-identifier="message">
            <span>(${message.time})</span>
            <p><b>${message.from}</b> ${message.text}</p>
         </article>`;
    } 
    else if (message.type === "message") {
        messagesSection.innerHTML = messagesSection.innerHTML + 
        `<article class="message" data-identifier="message">
            <span>(${message.time})</span>
            <p><b>${message.from}</b> para <b>${message.to}</b> ${message.text}</p>
         </article>`;
    }
    else if (message.to === userName || message.from === userName) {
        messagesSection.innerHTML = messagesSection.innerHTML + 
        `<article class="privateMessage" data-identifier="message">
            <span>(${message.time})</span>
            <p><b>${message.from}</b> reservadamente para <b>${message.to}</b> ${message.text}</p>
         </article>`;
    }

    const lastMessage = document.querySelector(".messages article:last-child");
    if (lastMessage !== null) {
        lastMessage.scrollIntoView();
    }
}

// MESSAGE SENDING
function sendMessageWithEnter (event) {
    if (event.key === "Enter" || event.key === undefined) {

        let message = document.querySelector("footer input").value;
        const visibilityIsPublic = document.querySelector(".visibilitySelection .selected span").textContent === "Público";
        let visibilityChosen = null;
        console.log(visibilityIsPublic)

        if (visibilityIsPublic) {
            visibilityChosen = "message";
        }
        else {
            visibilityChosen = "private_message";
        }

        const messagesObject = {
            from: userName,
            to: selectedReceiverSaved,
            text: message,
            type: visibilityChosen
        };
        document.querySelector("footer input").value = "";
        const sendMessagePromisse = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", messagesObject);
        sendMessagePromisse.then(getServerMessages);
        sendMessagePromisse.catch(couldntSendMessage);

    }
}

function couldntSendMessage (resposta) {
    alert("Você foi desconectado, a página será atualizada");
    window.location.reload();
}

// MESSAGE OPTIONS AND ONLINE USERS LIST
function openAndCloseMessageReceiverOptions () {
    const receiverOptions = document.querySelector("aside");
    receiverOptions.classList.toggle("hidden");
    const tenSeconds = 10000;
    setInterval(getUsers, 10000);
    getUsers();
}

function getUsers () {
    const onlineUsersPromisse = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
    onlineUsersPromisse.then(loadUsers);
}

function loadUsers (serverAnswer) {
    const onlineUsers = serverAnswer.data;
    document.querySelector(".receiverSelection").innerHTML = `<div onclick="selectThisReceiver(this);">
                                                                <ion-icon class="ionicon" name="people"></ion-icon>
                                                                <span>Todos</span>
                                                                <ion-icon class="check" name="checkmark-sharp"></ion-icon>
                                                              </div>`;
    onlineUsers.forEach(renderUsers);
}

function renderUsers (participant) {
    const onlineUsers = document.querySelector(".receiverSelection");
    if (participant.name === selectedReceiverSaved) {
        onlineUsers.innerHTML += `<div calss="selected" onclick="selectThisReceiver(this);">
                                <ion-icon class="ionicon" name="person-circle"></ion-icon>
                                <span>${participant.name}</span>
                                <ion-icon class="check hidden" name="checkmark-sharp"></ion-icon>
                              </div>`;
        return
    }
    onlineUsers.innerHTML += `<div onclick="selectThisReceiver(this);">
                                <ion-icon class="ionicon" name="person-circle"></ion-icon>
                                <span>${participant.name}</span>
                                <ion-icon class="check hidden" name="checkmark-sharp"></ion-icon>
                              </div>`;
}

let selectedReceiverSaved = null;

function selectThisReceiver (newReceiver) {
    const publicVisibility = newReceiver.classList.contains("public");
    const privateVisibility = newReceiver.classList.contains("private");
    const previousSelected = document.querySelector(".receiverSelection .selected");
    if (publicVisibility || privateVisibility) {
        const selectedReceiver = document.querySelector(".visibilitySelection .selected");
        selectedReceiver.classList.remove("selected");
        newReceiver.classList.add("selected");
        
    } else if (previousSelected !== null) {
        previousSelected.classList.remove("selected");
        newReceiver.classList.add("selected");
        selectedReceiverSaved = newReceiver.querySelector("span").innerText;
    } else {
        newReceiver.classList.add("selected");
        selectedReceiverSaved = newReceiver.querySelector("span").innerText;
    }

    const visibility = document.querySelector(".visibilitySelection .selected").innerText.toLowerCase();
    const receiverInfoDisplay = document.querySelector("footer span");
    receiverInfoDisplay.innerHTML = `Enviando para ${selectedReceiverSaved} (${visibility})`
}

