# fridge-freezer

## Http/Client
A http client to send requests.

### Properties

* *Params* [Http/Client/Params](Client/Params.md)

### Methods

#### request(params)

Do a request with the given params.

* *params* [Http/Client/Params](Client/Params.md) - A parameter object.

Return: A [Http/Client/Result](Client/Result.md) object.

### Events

#### warning
*function (error, params) { }*

Triggered if an error wars thrown. (For every retry)

* *error* Error - A error object.
* *params* [Http/Client/Params](Client/Params.md) - Request parameter object.

#### adapterRequest
*function (client, method) { }*

Triggered before the request was send.

* *client* org.apache.commons.httpclient.HttpClient - The adapter client.
* *method* org.apache.commons.httpclient.HttpMethodBase - The adapter method.

#### adapterResponse
*function (client, method) { }*

Triggered after the request was send.

* *client* org.apache.commons.httpclient.HttpClient - The adapter client.
* *method* org.apache.commons.httpclient.HttpMethodBase - The adapter method.

### Examples

#### Get request

```js
LoadScriptFile(getEnvironmentVar('NODESCHNAPS_LOADER_FILE'));

var HttpClient = require('fridge-freezer')('Http/Client');
var httpClient = new HttpClient();

NodeJS();
```

```js
httpParams = new HttpClient.Params();
httpParams.url = 'http://info.tbed.lse.trivago.trv/api/v2/text/sdfsdfsd/fsfsfsdf';
httpParams.method = 'GET';
httpParams.header['X-Test'] = 'test';
httpParams.credentials = new HttpClient.Params.Credentials();
httpParams.credentials.username = 'test';
httpParams.credentials.password = 'test';

var result = httpClient.request(httpParams);

var output = JSON.stringify(result, null, 4);

NodeJS();
```

```js
httpClient.close();

NodeJS();
```
