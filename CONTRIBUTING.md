# Contributing

Below are main design practices to abide by. They help keep this software easy and convenient to use. User experience is the number 1 priority for this project.

- _The less user has to configure, the better._ As much as possible any information required to do something must be deduced from available user input rather than asked from a user. As much as we can, we should store any information we work with in the configuration files to avoid asking for information twice. Additionally, if some information can be retrieved by making a call to AWS API then that should be always tried first.

- _The less user has to remember, things like CLI flags or parameters or arguments, the better._ This is the reason behind choosing interactive menus over more traditional switch interfaces.
