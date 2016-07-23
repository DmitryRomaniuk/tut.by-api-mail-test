var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var winston = require('winston');
var email, name, pass, themeMail, bodyMail, mailto, readMailA = [];
name = 'Jon';
email = 'test-user-1-simple@tut.by';
pass = '12345678';
mailto = 'test-user-1-simple@tut.by';
themeMail = 'hello world!';
bodyMail = 'Yahoo!! asdf 123';

winston.add(winston.transports.File, {filename: 'logfile.log'});

 var transporter = nodemailer.createTransport(smtpTransport({
 service: 'yandex',
 auth: {
 user: email,
 pass: pass
 }
 }));
 // send mail
 transporter.sendMail({
 from: email,
 to: mailto,
 subject: themeMail,
 text: bodyMail
 }, function (error, response) {
 if (error) {
 console.log(error);
 winston.log('error', error);
 } else {
 console.log('Message sent');
 winston.log('info', 'Message sent and we logging with winston');
 }
 });
 // verify connection configuration
 transporter.verify(function (error, success) {
 if (error) {
 console.log(error);
 } else {
 console.log('Server is ready to take our messages');
 }
 });

var Imap = require('imap'),
    inspect = require('util').inspect;

var imap = new Imap({
    user: email,
    password: pass,
    host: 'imap.yandex.ru',
    port: 993,
    tls: true
});

function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
}

imap.once('ready', function () {
    openInbox(function (err, box) {
        if (err) throw err;
        imap.search(['ALL'], function (err, results) {
            if (err) throw err;
            var f = imap.fetch(results, {bodies: ['HEADER', 'TEXT']});
            f.on('message', function (msg, seqno) {
                //console.log('Message #%d', seqno);
                var prefix = '(#' + seqno + ') ';
                var bufferForOneMail = {};
                msg.on('body', function (stream, info) {
                    /*if (info.which === 'TEXT')
                     console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);*/
                    var buffer = '', count = 0;
                    stream.on('data', function (chunk) {
                        buffer += chunk.toString('utf8');
                        if (info.which === 'TEXT') {bufferForOneMail.body = buffer.substr(0,buffer.length-2)}
                        if (info.which === 'HEADER') {
                            var bb = Imap.parseHeader(buffer);
                            if (bb.from.length > 0) bufferForOneMail.from = bb.from[0];
                            if (bb.subject.length > 0) bufferForOneMail.subject = bb.subject[0];
                            if (bb.to.length > 0) bufferForOneMail.to = bb.to[0];
                        }
                        //readMailA.push(buffer);
                        /*if (info.which === 'TEXT')
                         console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);*/
                    });
                    readMailA.push(bufferForOneMail);
                    stream.once('end', function () {
                        /*if (info.which !== 'TEXT') {
                         console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                         }
                         else
                         console.log(prefix + 'Body [%s] Finished', inspect(info.which));*/
                    });
                });
                msg.once('attributes', function (attrs) {
                    //console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                });
                msg.once('end', function () {
                    //console.log(prefix + 'Finished');
                });
            });
            f.once('error', function (err) {
                console.log('Fetch error: ' + err);
            });
            f.once('end', function () {
                //console.log('Done fetching all messages!');
                imap.end();
            });
        });
    });
});

imap.once('error', function (err) {
    console.log(err);
});

imap.once('end', function () {
    //console.log('Connection ended');
    console.log(readMailA);
});

imap.connect();