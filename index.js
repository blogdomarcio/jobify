const express = require('express')

const app = express()

const sqlite = require('sqlite')

const sqlite3 = require('sqlite3').verbose();

const path = require('path')

// const dbConnection = sqlite.open({
//     filename: './banco.sqlite',
//     driver: sqlite3.Database,
// }, { Promise })

// const dbConnection = sqlite.open({ filename: 'banco.sqlite', driver: sqlite3.Database }, { Promise })

// const dbConnection = sqlite.open(path.resolve(__dirname, 'banco.sqlite'), { Promise })

// const dbConnection = sqlite.open('banco.sqlite', { Promise })


const dbConnection = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error(err.message);
    }
    //console.log('Connected to the database.');
});

app.set('views', path.resolve(__dirname, 'views'))

app.set('view engine', 'ejs')

app.use(express.static(path.resolve(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }))

app.use('/admin', (req, res, next) => {
    if (req.hostname === 'localhost') {
        next()
    } else {
        res.render('admin/semacesso')
    }
})

const port = process.env.PORT || 3000

app.get('/', async (resquest, response) => {

    const db = await dbConnection

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

app.get('/vaga/:id', async (req, res) => {

    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = ' + req.params.id)

    // console.log(vaga)
    // console.log(req.params)
    res.render('vaga', {
        vaga
    })
})

app.get('/admin', async (req, res) => {
    res.render('admin/home')
})

app.get('/admin/departamentos', async (req, res) => {

    const db = await dbConnection

    const categorias = await db.all('select * from categorias;')


    res.render('admin/departamentos', { categorias })
})

app.get('/admin/vagas', async (req, res) => {

    const db = await dbConnection

    const vagas = await db.all('select * from vagas;')

    res.render('admin/vagas', { vagas })
})


app.get('/admin/vagas/excluir/:id', async (req, res) => {

    const db = await dbConnection

    await db.run('delete from vagas where id =' + req.params.id + '')

    res.redirect('/admin/vagas')
})


app.get('/admin/vagas/cadastrar/', async (req, res) => {

    const db = await dbConnection

    const categorias = await db.all('select * from categorias;')

    res.render('admin/cadastro', { categorias })
})

app.get('/admin/vagas/editar/:id', async (req, res) => {

    const db = await dbConnection

    const categorias = await db.all('select * from categorias;')

    const vaga = await db.get('select * from vagas where id =' + req.params.id + '')

    res.render('admin/editar-vaga', { categorias, vaga })
})

app.get('/admin/departamento/editar/:id', async (req, res) => {

    const db = await dbConnection

    const categoria = await db.get('select * from categorias where id =' + req.params.id + '')

    res.render('admin/editar-departamento', { categoria })
})


app.post('/admin/vagas/editar/:id', async (req, res) => {

    const db = await dbConnection

    const { id } = req.params

    const { categoria, titulo, descricao } = req.body

    await db.run(`update vagas set categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao}' where id = ${id} `)

    res.redirect('/admin/vagas')

})


app.post('/admin/departamento/editar/:id', async (req, res) => {

    const db = await dbConnection

    const { id } = req.params

    const { categoria } = req.body

    await db.run(`update categorias set categoria = '${categoria}' where id = ${id} `)

    res.redirect('/admin/departamentos')

})

app.get('/admin/departamento/cadastrar/', async (req, res) => {

    res.render('admin/cadastroDepartamento')
})

app.post('/admin/departamento/cadastrar/', async (req, res) => {

    const db = await dbConnection

    const { categoria } = req.body

    await db.run(`insert into categorias(categoria) values('${categoria}') `)

    res.redirect('/admin/departamentos')
})

    .get('/admin/departamento/excluir/:id', async (req, res) => {

        const db = await dbConnection

        await db.run('delete from categorias where id =' + req.params.id + '')

        res.redirect('/admin/departamentos')
    })




app.post('/admin/vagas/cadastrar/', async (req, res) => {

    const db = await dbConnection

    const { categoria, titulo, descricao } = req.body

    await db.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}', '${titulo}', '${descricao}') `)

    res.redirect('/admin/vagas')


})



const init = async () => {
    const db = await dbConnection
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
}

)