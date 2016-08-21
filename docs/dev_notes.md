Winter 2017 Shopify Intern Challenge Notes ✎
==========

To separate the 🌾 from the 💩, the fine folks at [shopify](https://www.shopify.com/) put forward a simple (?) task.

### The Challenge
Go to http://shopicruit.myshopify.com/products.json?page=1. What is the total cost of all **Clock** and **Watch** products?

P.S. There are multiple pages.

### The Approach
#### Let's be sneaky 1: `curl`
Sometimes, useful information can be hiding in response headers.
Hitting the target with `curl` tells me `products.json` will accept `GET` and `OPTIONS`.
Oooh, `OPTIONS` might [tell me how to use this API](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html).

No, [of course](http://zacstewart.com/2012/04/14/http-options-method.html) it doesn't ☹️. Start over.

#### Let's be sneaky 2: RTFM
Okay, I'll read the [API docs](https://help.shopify.com/api/reference/product).
I get it, I'm applying for a job with a company that spends a lot of time thinking about APIs.
They want to see if applicants are motivated enough to do things like _read_ and _look for existing solutions_ before slamming their face into a task.

Lo and behold, the docs tell me that I can get clocks and watches by specifying `?product_types=Clock,Watch`.
So, `?page=1` was a red herring and I'm about to be rewarded for my awesome reading skills 👌.

The demo API for this problem does not support these parameters 😐. Start over.

#### The obvious, boring solution
Guess I have to page through the results ¯\\\_(ツ)\_/¯.
Reading the docs wasn't a total wash since I discover that the `limit` param works.
Furthermore, all of the results will fit in under the max limit of 250.
💥 **No paging required!** 💥

This is a huge bonus because the response doesn't give me any paging data.
_Seriously_.
It's not in the payload or hiding in the response headers.
I have no idea how it expects me to know if there are more results and I should call again. Maybe there's a 'Pass paging data in response' ticket in the backlog 🌊.

I'm going to write up a solution that will page, though.
Showing 👏 off 👏 is 👏 the 👏 point 👏

### Implementation notes
The [API docs](https://help.shopify.com/api/reference/product) let me know that each `product` is composed of an array of `variants`.
The `variants` have the price.
No type is forced on the price.
```json
{
  "products": [
    {
      "title": "product 1",
      "variants": [
        {"title": "variant 1", "price": 9.99},
        {"title": "variant 2", "price": "7.99"}
      ],
      "..."
    },{
      "title": "product 2",
      "..."
    }
  ]
}
```

Since I'll be calling the API an unknown number of times I'll need to come up with a terminating condition based on the response.
Poking the API let's me figure out that it's pretty permissive with bad params.
A bad call isn't a 400 response.
Instead, it's a 200 with `{products: []}` as the body.
(_ed. This angers the REST gods since you can't tell a bad request from a legit empty response._)
Fine, I'll keep calling the API until I get back an empty result body.
Boring, but effective.

I don't know of a pattern that will give me the async niceness of promise chains and the compactness of a loop construct.
This might be because I'm thinking about the problem in the wrong way.
Or it might be because I've only been writing javascript for four months.

I think the recursive implementation of `getProductTypesVariants` is pretty okay.
I guess it could blow up on me if the API keeps returning non-empty results and I run out of memory but if that's the case I'd need refactor this thing to stream the results.
I'd be okay putting this up as a PR and letting a senior dev rip it apart.
