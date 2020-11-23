'use strict'
const Client = use('App/Models/Client')
class ClientController {
    async get({request, response})
    {
        
        const email = request.input("email")
        const client = await Client.findBy("email",email)
        console.log("Cliente: "+client)
        return client
        //return "Ok"
    }
}

module.exports = ClientController
