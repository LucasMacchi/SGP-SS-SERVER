![alt text](https://raw.githubusercontent.com/LucasMacchi/SGP-SS/refs/heads/main/public/logo_big.webp)

# SISTEMA DE GESTION DE PEDIDOS

El objetivo del proyecto es crear un sistema de pedidos para los CCO (Centros de Costos Operativos). En el mismo, los encargados podrán realizar pedidos de Insumos a la ADMINISTRACIÓN, los mismo podrán aprobarlo o no. 
Los encargados podrán realizar un pedido personalizado o establecer un pedido predeterminado o inicial, el mismo consiste en un pedido ya armado y que puede ser solicitado de forma rápida y fácil.

Este es el servidor, tiene como proposito la organizacion y formateo de datos que van al cliente o a la base de datos.

## TECNOLOGIAS USADAS
- NEST JS
- MYSQL
- TYPESCRIPT
- SQL

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## ENDPOINTS

### USUARIO
- AUTH (ADMIN) GET user/all --> Devuelve todos los usuarios
- AUTH () POST user/login --> body (username: string) Devuelve un JWT
- AUTH (ADMIN) POST user/register --> body (username: string, first_name: string, last_name: string, rol: number) Crea un usuario desactivado
- AUTH (ADMIN) PATCH user/activate/:username --> Param (username: string) Activa un usuario
- AUTH (ADMIN) PATCH user/desactivate/:username --> Param (username: string) Desactiva un usuario
- AUTH (ADMIN) PATCH user/email --> body (to_send, sender, msg) Manda un correo a un usuario

### PEDIDOS
- AUTH (ANY) GET pedido/all --> Devuelve todos los pedidos
- AUTH (ANY) POST pedido/add --> body(requester: string, service_id: number, client_id: number, user_id: number, insumos: array) Crea una orden y sus subsecuentes detalles
- AUTH (ANY) PATCH pedido/delivered/:id
- AUTH (ANY) PATCH pedido/cancel/:id
- AUTH (DEPOSITO) PATCH pedido/aprove/:id
- AUTH (ADMINISTRATIVO / DEPOSITO / ADMIN) PATCH pedido/reject/:id
- AUTH (ANY) PATCH pedido/problem/:id
- AUTH (ADMINISTRATIVO) PATCH pedido/archive/:id

### DATA
- AUTH (ANY) GET data/cco --> Trae todos los servicios
- AUTH (ANY) GET data/insumos --> Trae todos los insumos
- AUTH () GET data/ping --> Pingea el server
- AUTH (ANY) GET data/client --> Body (client_id: number, dateStart: string, dateEnd: string) Retorna los datos necesarios para la creacion del informe por cliente.

