const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate')
const cors = require('./cors')

const Favourites = require('../models/favourite');
const { json } = require('body-parser');
const user = require('../models/user');

const favoriteRouter = express.Router()

favoriteRouter.use(bodyParser.json())

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourites.find({ user: req.user._id })
            .populate('dishes')
            .populate('user')
            .then((favourites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favourites)
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.find({ user: req.user._id })
            .then((favs) => {
                if (favs.length == 0) {
                    Favourites.create({})
                        .then((fav) => {
                            favs.dishes = []
                            for (let i = 0; i < req.body.length; i++) {
                                favs.dishes.push(req.body[i]._id)
                            }
                            fav.user = req.user
                            fav.save()
                        })
                }
                else {
                    for (var i = 0; i < req.body.length; i++) {
                        for (j = 0; j < favs[0].dishes.length; j++) {
                            console.log(favs[0].dishes[0] == req.body[0]._id)
                            if (favs[0].dishes[j] == req.body[i]._id) {
                                err = new Error(`Already Exist in the Favorites ${favs[0].dishes[j]}`);
                                err.status = 404;
                                return next(err);
                            }
                        }
                    }
                    Favourites.updateOne({ user: req.user._id }, { $push: { dishes: req.body } })
                        .then((resp) => {
                            console.log(resp)
                        })
                }
                res.statusCode = 200
                res.json(favs)
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favourites');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favourites.deleteMany({ user: req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

favoriteRouter.route('/:Id')
    .get((req, res, next) => {
        res.end(`Get Endpoint ${req.params.Id}`)
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ user: req.user._id })
            .then((fav) => {
                
                for (let i = 0; i < fav.dishes.length; i++) {
                    if (req.params.Id == fav.dishes[i]) {
                        err = new Error('Duplicate Dishes are not allowed');
                        err.status = 404;
                        return next(err);
                    }
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                fav.dishes.push(req.params.Id)
                fav.user = req.user
                fav.save()
                res.json(fav);
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .put((res, req) => {
        res.send('Put Endpoint')
    })
    .delete(authenticate.verifyUser, (req, res) => {
        Favourites.findOne({ user: req.user._id })
            .then((fav) => {
                console.log(fav)
                console.log(fav.dishes.length)
                for (let i = 0; i < fav.dishes.length; i++) {
                    if (fav.dishes[i] == req.params.Id) {
                        fav.dishes.splice(i, 1)
                        fav.save()
                    }
                    else {
                        res.send(`Dish with dishId : ${req.params.Id} not Found`)
                    }
                }
            })
    })


module.exports = favoriteRouter