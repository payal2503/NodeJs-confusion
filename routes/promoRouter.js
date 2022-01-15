const express = require('express');
const bodyParser= require('body-parser');

var authenticate = require('../authenticate');
const Promotions = require('../models/promotions');
const { json } = require('express');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json())

promoRouter.route('/')
.get((req,res,next)=>{
    Promotions.find({})
    .then((promotions)=>{
        res.statusCode= 200;
        res.setHeader('content-type','application/json');
        res.json(promotions)
    },(err)=> next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Promotions.create(req.body)
    .then((Promotion) => {
        console.log('Promotion Created ', Promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Promotions.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

promoRouter.route('/:promotionId')
.get((req,res,next) => {
    Promotions.findById(req.params.promotionId)
    .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/'+ req.params.promotionId);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promotionId, {
        $set: req.body
    }, { new: true })
    .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promotionId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

// promoRouter.route('/:promoId')
// .all((req,res,next)=>{
//     res.statusCode = 200;
//     res.setHeader('content-type','text/plain');
//     next();
// })
// .get((req,res,next)=>{
//     res.end('Will send details of the promotion : ' +req.params.promoId + 
//     'to you!');
// })
// .post((req,res,next)=>{
//     res.statusCode=403;
//     res.end('POST operation not supported on /promotion/' + req.params.promoId);
// })
// .put((req,res,next)=>{
//     res.write('Updating the promotion:'+req.params.promoId +'\n')
//     res.end('Will update the promotion '+req.body.name + ' with details: '+req.body.description)
// })
// .delete((req,res,next)=>{
//     res.end('Deleting promotion: '+req.params.promoId);
// })

module.exports = promoRouter;