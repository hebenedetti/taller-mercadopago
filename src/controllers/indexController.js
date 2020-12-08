const mercadopago = require('mercadopago');

mercadopago.configure({

    access_token: 'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398',
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004',

})

module.exports = {
    home: (req, res) => {
        return res.render("index");
    },
    detail: (req, res) => {
        return res.render("detail", { ...req.query });
    },
    callback: (req,res) => {
        console.log(req.query)
        
        if(req.query.status.includes('success')) {
            return res.render('success',{
                paymentId: req.query.payment_id,
                paymentType: req.query.payment_type,
                status: req.query.collection_status,
                preferenceId: req.query.preference_id,
                extReference: req.query.external_reference
            })
        }

        if(req.query.status.includes('pending')) {
            return res.render('pending')
        }

        if(req.query.status.includes('failure')) {
            return res.render('failure')
        }

        return res.status(404).end()
    
    },
    notifications: (req,res) => {
        console.log('-------INICIO WEBHOOK-------')
        console.log(req.body)
        console.log('-------FIN WEBHOOK-------')
        res.status(200).end('Ok')
    },
    comprar: (req,res) => {

        //Host de pruebas
        //const host = 'http://localhost:3000/'
        //Host de produccion
        const host = 'https://taller-mp.herokuapp.com/'

        const url = host + 'callback?status='

        let preference = {

            "back_urls": {
                "success": url + 'success',
                "pending": url + 'pending',
                "failure": url + 'failure',
            },

            "notification_url": host + 'notifications',

            "auto_return": 'approved',

            payer: {
                name: 'Lalo',
                surname: 'Landa',
                email: 'test_user_63274575@testuser.com',
                phone: {
                    area_code: '11',
                    number: 22223333
                },
                address: {
                    street_name: 'False',
                    street_number: 123,
                    zip_code: '1111'
                }
            },

            payment_methods:{
                excluded_payment_methods: [
                    {id: 'amex'}
                ],
                excluded_payment_types: [
                    {id: 'atm'}
                ],
                installments: 6

            },

            items: [
                {
                    id: '1234',
                    picture_url: 'https://taller-mp.herokuapp.com/images/products/' + req.body.img,
                    title: req.body.title,
                    description: 'Dispositivo móvil de Tienda e-commerce',
                    unit_price: parseFloat(req.body.price),
                    quantity: 1
                }
            ],

            external_reference: 'hebenedetti@gmail.com'

        }

        mercadopago.preferences.create(preference).then(response => {
            global.init_point = response.body.init_point;
            res.render('confirm')
        }).catch(error => {
            console.log(error)
            res.send('error')
        })

    }
}