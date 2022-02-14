const users = []

const addUser = ({ id, username, room }) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }

    // check for exixting user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    // validate username
    if(existingUser){
        return {
            error: 'username is in use!'
        }
    }

    // store user
    const user = { id, username, room }
    users.push(user)

    return {user}

}



const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)

    if(index != -1){
        return users.splice(index, 1)[0]
    }
}


const getUser = (id)=>{
    return users.find((user)=> user.id === id)

}


const getUsersInRoom = (room)=>{
    
    return users.filter((user)=>user.room === room)
}


const getRooms = ()=>{
    let roomsName = users.map((user)=> {
        return user.room
    })

    // roomsName = roomsName.filter((c, index) => {
    //     return roomsName.indexOf(c) === index;
    // });

    roomsName = [...new Set(roomsName)]
    return roomsName.map((room)=> {
        return { roomname: room }
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
}