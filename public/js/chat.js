const socket = io()
// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const roomSidebarTemplate = document.querySelector('#room-sidebar-template').innerHTML
const appSidebarTemplate = document.querySelector('#app-sidebar-template').innerHTML

// options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = ()=>{
    //new message element
    const $newMessage = $messages.lastElementChild
    
    // height of thr new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageheight = $newMessage.offsetHeight + newMessageMargin

    // visible height 
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight


    if(containerHeight - newMessageheight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }


    console.log(newMessageMargin)
    console.log(newMessageheight)


}


// listenning to text messages events
socket.on('message', (message)=>{
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// listenning to location messages events
socket.on('locationMessage', (message)=>{
    console.log(message)

    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(roomSidebarTemplate, {
        room,
        users
    })
    document.querySelector('#room-sidebar').innerHTML = html
})

socket.on('appData', ({availableRooms})=>{
    const html = Mustache.render(appSidebarTemplate, {
        availableRooms
    })
    document.querySelector('#app-sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    // disable
    const messageText = e.target.elements.message.value
    
    socket.emit('sendMessage', messageText, (err)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()
        // enable
        if(err){
            return console.log(err)
        }

        console.log("Message delivered!")
    })
})



$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    
    $sendLocationButton.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        },(err)=>{
            $sendLocationButton.removeAttribute('disabled')
            if(err){
                return console.log(err)
            }
            
            console.log("location is shared!")
        })
    })
})


socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})