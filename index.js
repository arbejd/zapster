import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("./constants/senders.json");
import {publish} from 'ntfy';

var imaps = require('imap-simple');
var config = {
    imap: {
        user: 'mathias@anymate.io',
        password: process.env.mathiaspw,
        host: 'mail.simply.com',
        port: 143,
        tls: false,
    }
};

const callback = async (err,connection) => {
   await connection.openBox('INBOX')
  
  
  const searchOptions = ['UNSEEN'];
  const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };
         const messages =  await connection.search(searchOptions, fetchOptions); 
const froms = messages.map(message => message.parts[0].body.from)

const onlyEmailsInInbox = froms.map(from => emailOnly(from[0]))
const criticals = data.map(crit => crit.importance === "CRITICAL" && crit.email)

const crits = onlyEmailsInInbox.filter(email => {
let decision = criticals.map(test => {
   return email.indexOf(test)
})
return decision.some(x => x > -1) 
})
if (crits && crits.length > 0){
  const cleanup = [...new Set(crits)] 
    const message = `critical messages in the anymate inbox from:${cleanup}` 
    await publish({
        message,
        topic: 'stue',
      });
}

console.log(crits)


connection.end()
}

const main =  () => {    
imaps.connect(config, callback)
}
main();



// Function to extract email using map
const emailOnly = item => {
    // Regex to match email inside angle brackets
    let match = item.match(/(?<=<)[^>]+(?=>)/g);
    return match ? match[0] : item; 
};