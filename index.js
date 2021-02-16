const firebase = require("firebase")
const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyD4MjAY3PHlyM-PFamEgzTPdZfSSHNVLA8",
    authDomain: "recipes-backend-46c08.firebaseapp.com",
    projectId: "recipes-backend-46c08",
    storageBucket: "recipes-backend-46c08.appspot.com",
    messagingSenderId: "582888779214",
    appId: "1:582888779214:web:8e4e6aaae4d61c3e05cf9f"
})

const cors = require('cors')
const express = require('express')
const app = express()
const port = process.env.PORT || 4999

const bodyParser = require('body-parser')

const jwt = require('jsonwebtoken')

app.use(cors())

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json())

//VERIFY JWT TOKEN
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization']

    if(bearerHeader) {
        const bearer = bearerHeader.split(" ")
        const bearerToken = bearer[1]

        req.token = bearerToken;
        next();
    } else {
        
        res.json({
            message: "Unauthorized",
            data: []
        })
    }
}

//LOGIN
app.post('/api/login', async (req,res) => {

    let { input, password, isAnEmail } = req.body

    let output = {
        email: '',
        password: '',
        phoneNumber: ''
    }

    if(isAnEmail) {
        let reference = await firebaseApp.firestore().collection('heeko-login').where('email','==',input).get()
        reference.forEach(item => {
            if(item.data()){
                output.email = item.data().email,
                output.password = item.data().password
            }
        })
    } else {
        let reference = await firebaseApp.firestore().collection('heeko-login').where('phoneNumber','==',input).get()
        reference.forEach(item => {
            if(item.data()){
                output.phoneNumber = item.data().phoneNumber,
                output.password = item.data().password
            }
        })
    }

    // console.log(65, output)

    if((input === output.email || output.phoneNumber) && output.password === password) {
        jwt.sign({input}, 'secretkey', (err, token) => {
            if(err) {
                res.json({
                    message: "token error",
                    token: ''
                })
            } else {
                res.json({
                    message: 'authenticated',
                    token
                })
            }
        })
    } else {
        res.json({
            message: "Wrong credentials",
            token: ''
        })
    }

})

//RETRIEVE FORGOT PASSWORD
app.post('/api/forgotPassword', async (req, res) => {
    let {input, isAnEmail} = req.body

    let output = {
        email: '',
        phoneNumber: '',
        password: ''
    }

    if(isAnEmail) {
        let reference = await firebaseApp.firestore().collection('heeko-login').where('email', '==', input).get()
        reference.forEach(item => {
            output.email = item.data().email
            output.phoneNumber = item.data().phoneNumber
            output.password = item.data().password
        })
    } else {
        let reference = await firebaseApp.firestore().collection('heeko-login').where('phoneNumber', '==', input).get()
        reference.forEach(item => {
            output.email = item.data().email
            output.phoneNumber = item.data().phoneNumber
            output.password = item.data().password
        })
    }
    
    if(output.email || output.phoneNumber) {
        res.json({
            message: "available",
            output
        })
    } else {
        res.json({
            message: 'unavailable',
            output
        })
    }
})

//API CHECK
app.get('/api/welcome', (req,res) => {
    res.send("Welcome!, API is working")
})

//LISTENING TO API
app.listen(port, () => {
    console.log("Listening to port: ", port)
})