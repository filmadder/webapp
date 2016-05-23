# Signals

List of signals


## auth

create account: {email, name, password1, password2} -> - : error
login: {email, password} -> - : error
logout: - -> - : error


## films

search films: {query} -> [{id, title}] : error
get film: {id} -> {id, title, ..} : error
set film status: {id, status} -> - : error
add comment: {text} -> - : error
add reply: {comment, text} -> - : error


## views

route to: {url} -> - : -
show error: {text} -> - : -
show success: {text} -> - : -


