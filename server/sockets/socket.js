const { io } = require('../server');
const { Usuarios } = require("../classes/usuarios")
const { crearMensaje } = require("../helpers/utilidades")

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on("entrarChat", (usuario, callback) => {
        if ( !usuario.nombre || !usuario.sala ) {
            return callback({
                ok: false,
                msg: "El nombre/sala es necesario"
            })
        }

        client.join(usuario.sala)

        let personas = usuarios.agregarPersona( client.id, usuario.nombre, usuario.sala)

        client.to(usuario.sala).emit("listaPersonas", usuarios.getPersonasPorSala(usuario.sala) );

        callback(personas)
    })

    client.on("crearMensaje", (data) => {
        let persona = usuarios.getPersona(client.id)
        let mensaje = crearMensaje( persona.nombre, data.msg )

        client.to(persona.sala).emit("crearMensaje", mensaje)
    })

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona( client.id );

        client.to(personaBorrada.sala).emit("crearMensaje", crearMensaje("Administrador", `${personaBorrada.nombre} salio del chat`) )
        client.to(personaBorrada.sala).emit("listaPersonas", usuarios.getPersonasPorSala(personaBorrada.sala) );
    });

    // Mensajes Privados
    client.on("mensajePrivado", data => {        
        let persona = usuarios.getPersona(client.id)
        client.to(data.para).emit("mensajePrivado", crearMensaje(persona.nombre, data.msg))
    })

});