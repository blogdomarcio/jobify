const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path');
const { hostname } = require('os');

const sqlite3 = require('sqlite3').verbose();
const dbConnection = new sqlite3.Database(path.resolve(__dirname, 'banco.sqlite'), (err) => {
    if (err) {
        console.error(err.message);
    }
    //console.log('Connected to the database.');
});

const port = process.env.PORT || 3000

app.use('/admin', (req, res, next) => {
    if (req.hostname === 'localhost') {
        next()
    } else {
        res.send('Sorry, You Are Not Allowed to Access This Page')
    }
})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
    const db = await dbConnection
    const sqlCategorias = "SELECT * FROM categorias"
    const sqlVagas = "SELECT * FROM vagas"
    db.all(sqlCategorias, [], (err, categoriasDb) => {
        db.all(sqlVagas, function (err, vagas) {
            const categorias = categoriasDb.map(cat => {
                return {
                    ...cat,
                    vagas: vagas.filter(vaga => vaga.categoria === cat.id)
                }
            })
            res.render('home', {
                categorias
            })
        })
    })
})

app.get('/vaga/:id', async (req, res) => {
    const db = await dbConnection
    const sql = "SELECT * FROM vagas WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("vaga", {
            vaga: row
        });
    });
})

app.get('/admin', (req, res) => {
    res.render('admin/home')
})

app.get('/admin/vagas', (req, res) => {
    const db = dbConnection
    const sql = "SELECT * FROM vagas"
    db.all(sql, [], (err, results) => {
        res.render("admin/vagas", {
            results
        });
    });
})


app.get('/admin/vagas/delete/:id', async (req, res) => {
    const db = await dbConnection
    await db.run('DELETE FROM vagas WHERE id = ' + req.params.id + '')
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/nova', async (req, res) => {
    const db = dbConnection
    const sql = "SELECT * FROM categorias"
    db.all(sql, [], (err, categorias) => {
        res.render("admin/nova-vaga", {
            categorias
        });
    });
})

app.post('/admin/vagas/nova', async (req, res) => {
    const db = await dbConnection
    const { titulo, descricao, categoria } = req.body
    await db.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}', '${titulo}', '${descricao}')`) //use temlate string (`)para adicionar variáveis à expressão sql
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/editar/:id', async (req, res) => {
    const db = dbConnection
    const { id } = req.params
    const sqlCategorias = "SELECT * FROM categorias"
    const sqlVagas = `SELECT * FROM vagas WHERE id='${id}'`
    db.all(sqlCategorias, [], (err, categorias) => {
        db.all(sqlVagas, function (err, vaga) {
            res.render('admin/editar-vaga', {
                categorias, vaga
            })
        })
    })
})

app.post('/admin/vagas/editar/:id', async (req, res) => {
    const db = await dbConnection
    const { titulo, descricao, categoria } = req.body
    const { id } = req.params
    await db.run(`UPDATE vagas set categoria='${categoria}', titulo='${titulo}', descricao='${descricao}' WHERE id='${id}'`) //use temlate string (`)para adicionar variáveis à expressão sql
    res.redirect('/admin/vagas')
})

app.get('/admin/categorias', (req, res) => {
    const db = dbConnection
    const sql = "SELECT * FROM categorias"
    db.all(sql, [], (err, categorias) => {
        res.render("admin/categorias", {
            categorias
        });
    });
})

app.get('/admin/categorias/delete/:id', async (req, res) => {
    const db = await dbConnection
    await db.run('DELETE FROM categorias WHERE id = ' + req.params.id + '')
    res.redirect('/admin/categorias')
})

app.get('/admin/categorias/nova', async (req, res) => {
    res.render("admin/nova-categoria");
})

app.post('/admin/categorias/nova', async (req, res) => {
    const db = await dbConnection
    const { categoria } = req.body
    await db.run(`insert into categorias(categoria) values('${categoria}')`) //use temlate string (`)para adicionar variáveis à expressão sql
    res.redirect('/admin/categorias')
})

app.get('/admin/categorias/editar/:id', async (req, res) => {
    const db = dbConnection
    const { id } = req.params
    const sql = `SELECT * FROM categorias WHERE id='${id}'`
    db.all(sql, [], (err, categorias) => {
        res.render('admin/editar-categoria', {
            categorias
        })
    })
})

app.post('/admin/categorias/editar/:id', async (req, res) => {
    const db = await dbConnection
    const { categoria } = req.body
    const { id } = req.params
    await db.run(`UPDATE categorias set categoria='${categoria}' WHERE id='${id}'`) //use temlate string (`)para adicionar variáveis à expressão sql
    res.redirect('/admin/categorias')
})


const init = async () => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    // const categoria = 'Social Media'
    // await db.run(`insert into categorias(categoria) values('${categoria}')`) 

    //db.run("UPDATE vagas SET categoria = 3 WHERE (id = 3);");
}
init()


app.listen(port, (err) => {
    if (err) {
        console.log('Não foi possível iniciar o servidor')
    } else {
        console.log('O servidor Jobify está online!')
    }
})