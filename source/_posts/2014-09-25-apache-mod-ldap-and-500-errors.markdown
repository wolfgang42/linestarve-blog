---
layout: post
title: "Apache, mod_ldap, and 500 errors"
date: 2014-09-25 00:49:41 -0400
tags: ["Apache HTTPd", "mod_ldap"]
---
I just finished setting up an Apache server with LDAP authentication. I got everything set up and restarted Apache,
but when I loaded a page it blew up with an Apache 500 Internal Server Error.
*No problem,* I thought, *I'll just check the logs.* Absolutely nothing was being logged.
After a lot of searching the Internet, trying things out, and hair-tearing, I eventually
discovered that this is a [known bug in mod_authz_ldap (#50630)](https://issues.apache.org/bugzilla/show_bug.cgi?id=50630).

If your LDAP server is using self-signed certificates, the LDAP module silently fails without logging an error
anywhere. To see if this is your issue, try adding the following line to your Apache configuration (remember to restart Apache afterward!):

	LDAPVerifyServerCert Off

This will prevent the error from occurring, but also is less secure (someone could pretend to be the LDAP server
and Apache would never know). If this is a concern, set
[`LDAPTrustedGlobalCert`](http://httpd.apache.org/docs/current/mod/mod_ldap.html#ldaptrustedglobalcert)
to your LDAP server's CA certificate.