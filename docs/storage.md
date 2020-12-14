# Storage

This project uses two distinct database to work, one instance of the MariaDB's MySQL and one instance of sqlite3. Why? Well, some data need to be easy to get and with hight availability, and other don't.
So, sqlite handle short but crucial data like cookies and session metadata, and MySQL handle the permanent storage files, like passwords, e-mail, name, etc.  
PHP uses a bunch of files, on the tmp folder to handle such data, but with since they are just a few bytes-long, and the faster we get it, better our performance will be I decided to use a memory stored database, with the simple but powerful sqlite's engine to help keep everything in order and with minimal overhead