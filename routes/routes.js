const express = require('express');
const route = express.Router();
const path = require('path');
const fs = require('fs');

const AuthController = require("../controller/AuthController");
const User = require("../models/UserModel");
const mongoose = require("mongoose");
const uuid = require("uuid");
const jwt = require('jsonwebtoken')
const utils = require("../controller/Utils");

module.exports = function (route) {
    route.use((req, res, next) => {
        var uemail = req.session.useremail;
        const allowUrls = ["/login", "/auth-validate", "/register", "/signup", "/forgotpassword", "/sendforgotpasswordlink", "/resetpassword", "/error", "/changepassword"];

        if (allowUrls.indexOf(req.path) !== -1) {
            if (uemail != null && uemail != undefined) {
                return res.redirect('/');
            }
        } else if (!uemail) {
            return res.redirect('/login');
        }
        next();
    })

    route.get('/auth-confirm-mail', (req, res, next) => {
        res.render('auth-confirm-mail', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-email-verification', (req, res, next) => {
        res.render('auth-email-verification', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-lock-screen', (req, res, next) => {
        res.render('auth-lock-screen', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-login', (req, res, next) => {
        res.render('auth-login', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-logout', (req, res, next) => {
        res.render('auth-logout', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-recoverpw', (req, res, next) => {
        res.render('auth-recoverpw', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-register', (req, res, next) => {
        res.render('auth-register', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-two-step-verification', (req, res, next) => {
        res.render('auth-two-step-verification', {layout: 'layout/layout-without-nav'});
    })

    route.get('/', async (req, res, next) => {
        res.redirect('/dashboard');
    })

    route.get('/index', (req, res, next) => {
        res.redirect('/dashboard');
    })

    route.get('/layouts-vertical', (req, res, next) => {
        res.render('layouts-vertical');//, {layout: 'layout/layout-vertical'});
    })

    // Auth
    route.get('/login', (req, res, next) => {
        res.render('auth/login', {
            title: 'Login',
            layout: 'layout/layout-without-nav',
            'message': req.flash('message'),
            error: req.flash('error')
        })
    })

    // validate login form
    route.post("/auth-validate", AuthController.validate)

    // logout
    route.get("/logout", AuthController.logout);

    route.get('/register', (req, res, next) => {
        res.render('auth/register', {
            title: 'Register',
            layout: 'layout/layout-without-nav',
            'message': req.flash('message'),
            'error': req.flash('error')
        })
    })

    // validate register form
    route.post("/signup", AuthController.signup)


    route.get('/forgotpassword', (req, res, next) => {
        res.render('auth/forgotpassword', {
            title: 'Forgot password',
            layout: 'layout/layout-without-nav',
            message: req.flash('message'),
            error: req.flash('error')
        })
    })

    // send forgot password link on user email
    route.post("/sendforgotpasswordlink", AuthController.forgotpassword)

    // reset password
    route.get("/resetpassword", AuthController.resetpswdview);
    // Change password
    route.post("/changepassword", AuthController.changepassword);

    //500
    route.get('/error', (req, res, next) => {
        res.render('auth/auth-500', {title: '500 Error', layout: 'layout/layout-without-nav'});
    })

    route.get('/faq', async (req, res, next) => {
        const global = await utils.getGlobal(req)

        if (req.session.role === "Admin")
            res.render('pages-faqs-admin', {global: global})
        else if (req.session.role === "Arbitrator")
            res.render('pages-faqs-arbitrator', {global: global})
    })

    route.get('/ranking', async (req, res, next) => {
        const global = await utils.getGlobal(req)
        res.render('ranking', {global: global})
    })
}
