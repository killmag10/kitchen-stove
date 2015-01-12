# fridge-freezer

## Http/Client/Params
The parameter object for the http client.

### Properties

* *Credentials* Http/Client/Params/Credentials
* *Proxy* Http/Client/Params/Proxy
* *prototype*
  * *url* String - Request url.
  * *timeout* Number - Timeout in milliseconds.
  * *method* String - The method type: get, post, put, delete, head, options, trace
  * *header* Object - Key value object with http headers.
  * *body* String|Object|[Http/Client/Entity](Entity.md) - Body to send.
  * *encoding* String - Encoding to use. null = use header.
  * *retries* Number - Max retries to do after a error.
  * *credentials* [Http/Client/Params/Credentials](Params/Credentials.md) | A credentials params object.
  * *proxy* [Http/Client/Params/Proxy](Params/Proxy.md) | A proxy params object.
