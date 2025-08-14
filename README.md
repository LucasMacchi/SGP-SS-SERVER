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
- AUTH (ANY) PATCH pedido/delivered/:id --> Cambia el estado a "entregado"
- AUTH (ANY) PATCH pedido/cancel/:id --> Cambia el estado a "cancelado"
- AUTH (ANY) PATCH pedido/ready/:id --> Cambia el estado a "listo"
- AUTH (DEPOSITO) PATCH pedido/aprove/:id --> Cambia el estado a "aprobado"
- AUTH (ADMINISTRATIVO / DEPOSITO / ADMIN) PATCH pedido/reject/:id --> Cambia el estado a "rechazado"
- AUTH (ANY) PATCH pedido/problem/:id --> Cambia el estado a "problemas"
- AUTH (ADMINISTRATIVO) PATCH pedido/archive/:id --> archiva
- AUTH (ANY) GET pedido/detail/:id --> devuelve los datos de un pedido especifico
- AUTH (ANY) POST pedido/insumo/:id --> body (insumo) --> Este agrega un insumo a un pedido ya creado
- AUTH (ANY) DELETE pedido/insumo/:id --> elimina un insumo de un pedido
- AUTH (ANY) PATCH pedido/cantidad/:id/:cantidad --> modifica la cantidad de un insumo en un pedido
- AUTH (ANY) PATCH pedido/provisional/:id --> asigna un servicio a un provisional
- AUTH (ANY) POST pedido/report --> body (reportDto) --> genera un reporte sobre ese pedido

### DATA
- AUTH (ANY) GET data/cco --> Trae todos los servicios
- AUTH (ANY) GET data/insumos --> Trae todos los insumos
- AUTH () GET data/ping --> Pingea el server
- AUTH (ANY) GET data/client --> Body (client_id: number, dateStart: string, dateEnd: string) Retorna los datos necesarios para la creacion del informe por cliente.
- AUTH (ANY) GET data/categories --> devuelve las categorias de reportes
- AUTH (ANY) GET data/reports/:id --> devuelve los reportes de un pedido por su id
- AUTH (ANY) GET data/errors ---> devuelve categorias de errores y/o problemas
- AUTH (ANY) POST data/errors ---> envia un email informando sobre los errores
- AUTH (ANY) GET data/categories/insumos --> devuelve las categorias y rubros de los insumos
- AUTH (ANY) GET data/collection --> devuelve los pedidos de una coleccion para imprimirlas
- AUTH (ANY) GET data/collection/remito --> devuelve los pedidos de una coleccion para imprimirlas en un remito
- AUTH (ANY) GET data/insumos/complete --> Devuelve los insumos pero como objetos completos

### COMRPAS
- AUTH (ANY) GET compras/areas --> devuelves las areas para realizar una compra
- AUTH (ANY) POST compras/registrar --> crear una nueva compra
- AUTH (ANY) PATCH compras/aprove/:id --> aprueba una compra y manda el correo al sistema de tickets
- AUTH (ANY) PATCH compras/preaprove/:id --> pre aprueba una compra, esto solo pasa con compras de racionamiento
- AUTH (ANY) PATCH compras/null/:id --> rechaza una compra
- AUTH (ANY) PATCH compras/deactivate/:id --> descativa o oculta una compra
- AUTH (ANY) GET compras/all --> devuelve todas las compras
- AUTH (ANY) GET compras/uniq/:id --> devuelve una compra especifica
- AUTH (ANY) GET compras/uniqbynro/:nro --> devuelve una compra por su NUMERO
- AUTH (ANY) PATCH compras/edit/des --> modifica la descripcion de un insumo de una compra
- AUTH (ANY) PATCH compras/edit/cant --> modifica la cantidad de un insumo de una compra
- AUTH (ANY) PATCH compras/edit/delete --> elimina un insumo de una compra







