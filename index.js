const express = require('express')
const app = express()

const bodyParser = require('body-parser')

const sqlite = require('sqlite')

const path = require('path')

const dbConnnection = sqlite.open(path.resolve(__dirname, 'banco.sqlite', { Promise }))

app.set('view engine', 'ejs') app.use(express.static('public'))

app.use(bodyParser.urlencoded({
    extended: true
}))

const port = process.env.PORT || 3000

app.get('/', async(resquest, response) => {

    const db = await dbConnnection

    const categoriasDb = await db.all('select * from categorias;')

    const vagas = await db.all('select * from vagas;')

    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoria === cat.id)
        }
    })

    response.render('home', { categorias })
})

app.get('/vaga/:id', async(req, res) => {

    const db = await dbConnnection
    const vaga = await db.get('select * from vagas where id = ' + req.params.id)

    // console.log(vaga)
    // console.log(req.params)
    res.render('vaga', {
        vaga
    })
})

app.get('/admin', async(req, res) => {
    res.render('admin/home')
})

app.get('/admin/categorias', async(req, res) => {

    const db = await dbConnnection

    const categorias = await db.all('select * from categorias;')


    res.render('admin/categorias', { categorias })
})

app.get('/admin/vagas', async(req, res) => {

    const db = await dbConnnection

    const vagas = await db.all('select * from vagas;')

    res.render('admin/vagas', { vagas })
})


app.get('/admin/vagas/excluir/:id', async(req, res) => {

    const db = await dbConnnection

    await db.run('delete from vagas where id =' + req.params.id + '')

    res.redirect('/admin/vagas')
})


app.get('/admin/vagas/cadastrar/', async(req, res) => {

    const db = await dbConnnection

    const categorias = await db.all('select * from categorias;')

    res.render('admin/cadastro', { categorias })
})

app.get('/admin/vagas/editar/:id', async(req, res) => {

    const db = await dbConnnection

    const categorias = await db.all('select * from categorias;')

    const vaga = await db.get('select * from vagas where id =' + req.params.id + '')

    res.render('admin/editar-vaga', { categorias, vaga })
})

app.post('/admin/vagas/editar/:id', async(req, res) => {

    const db = await dbConnnection

    const { id } = req.params

    const { categoria, titulo, descricao } = req.body

    await db.run(`update vagas set categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao}' where id = ${id} `)

    res.redirect('/admin/vagas')

})

app.get('/admin/categoria/cadastrar/', async(req, res) => {

    res.render('admin/cadastroCategoria')
})

app.post('/admin/categoria/cadastrar/', async(req, res) => {

    const db = await dbConnnection

    const { categoria } = req.body

    await db.run(`insert into categorias(categoria) values('${categoria}') `)

    res.redirect('/admin/categorias')
})

.get('/admin/categoria/excluir/:id', async(req, res) => {

    const db = await dbConnnection

    await db.run('delete from categorias where id =' + req.params.id + '')

    res.redirect('/admin/categorias')
})




app.post('/admin/vagas/cadastrar/', async(req, res) => {

    const db = await dbConnnection

    const { categoria, titulo, descricao } = req.body

    await db.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}', '${titulo}', '${descricao}') `)

    res.redirect('/admin/vagas')


})



const init = async() => {
    const db = await dbConnnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
        // const vaga = 'Marketing team (Remote)'
        // const descricao = 'Vaga para Marketing team (Remote)'
        // await db.run(`insert into vagas(categoria, titulo, descricao) values(1, '${vaga}', '${descricao}') `)
        // await db.run(`insert into categorias(categoria) values('${categoria}')`)
}
init()

app.listen(port, (err) => {
    if (err) {
        console.log('Erro ao iniciar servidor')
    } else {
        console.log('Servidor Jobify iniciado com sucesso - @blogdomarcio')
    }
})