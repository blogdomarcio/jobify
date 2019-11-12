const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
 

app.get('/', (resquest, response) => {
    response.render('home')
} )


app.listen(3000, (err) => {
    if(err){
        console.log('Erro ao iniciar servidor')
    }else {
        console.log('Servidor Jobify iniciado com sucesso - @blogdomarcio')
    }
})