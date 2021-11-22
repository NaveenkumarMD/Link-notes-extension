function set_favicon(url, item, node) {

    var req = new XMLHttpRequest();
    if (req == null) alert("null res");


    req.open("GET", url, true);//"http://www.mozilla.org/index.html")
    req.onerror = function () { req.abort(); }
    req.onreadystatechange = function () {
        //alert(req.readyState + " " + req.status +" " + url);
    }
    req.onload = function () {
        var rep = req.responseText;

        //we start by finding the header, to reduce the lenght of the string use in
        //the following regexpr
        var i1 = rep.indexOf("head");
        var icon_name = "";
        if (i1 == -1) i1 = rep.indexOf("HEAD");

        var i2 = rep.lastIndexOf("/head");
        if (i2 == -1) i2 = rep.lastIndexOf("/HEAD");

        //if there is a header
        if (i2 != -1 && i1 != -1) {
            // puting the header in rep
            rep = rep.substring(i1, i2);

            //finding the url of the icon "icon..." href="...3
            var reg = /icon.*\".*href *= *\"(.*\.(ico|png))\"/i;
            var url_icon = reg.exec(rep);

            if (url_icon == null) {
                //here we test if the attributes are inverted href="..." rel="...."
                var reg3 = /href= *\" *(.*\.(ico|png))\".*rel= *\".*icon/i; //"
                url_icon = reg3.exec(rep);
            }
            if (url_icon != null) {
                // we test if the path is an absolute one
                var i3 = url_icon[1].indexOf("http");
                if (i3 == -1) i3 = url_icon[1].indexOf("HTTP");

                if (i3 != -1) { //absolute path
                    icon_name = url_icon[1];
                } else { //relative path
                    icon_name = url + url_icon[1];
                }
            }
            else {
                // there is no icon url in the header => we use the default value
                icon_name = url + "favicon.ico";
            }
        }
        // no header then default value
        else {
            icon_name = url + "favicon.ico";
        }
        node.setAttribute("value", icon_name);
        item.setAttribute("image", icon_name);
    }
    req.send(null);

}

var addbutton = document.getElementById('addbutton')
var footer = document.getElementById('footer')
var newsubmit = document.getElementById('new-submit')
var taginput = document.getElementById('tag-input')
var linkinput = document.getElementById('link-input')

//Add button click handler
addbutton.addEventListener('click', () => {
    addbutton.style.display = "none"
    footer.style.height = "auto"
    document.getElementById("search-container").style.display = "none";
    document.getElementById("mySidenav").style.width = "0";
})

//Creating new link data
newsubmit.addEventListener('click', async () => {
    document.getElementById("search-container").style.display = "none";
    document.getElementById("mySidenav").style.width = "0";
    addbutton.style.display = "flex"
    footer.style.height = "0"
    let tag = taginput.value
    let link = linkinput.value
    if (!tag || !link) return

    chrome.storage.sync.get(['data'], result => {
        let newdata = {
            tag: tag,
            link: link,
            favourite: false
        }
        let data = result.data ? [newdata, ...result.data] : [newdata]
        chrome.storage.sync.set({ data: data }, () => {
            console.log("Updated")
            tag.value = ""
            link.value = ""
            load(data)
        })
    })
})

// getting all data and displaying it

let data = []
var contentelement = document.getElementById('content')


function load(data) {
    if (!data || data.length == 0) {
        contentelement.innerHTML = " "
        const Nodata = document.createElement('div')
        const nodataText = document.createElement('h2')
        nodataText.innerHTML = "No data"
        nodataText.classList.add('nodata')
        Nodata.classList.add('nodata-container')
        const NodataSVG = document.createElement('img')
        NodataSVG.style.width = "100%"
        NodataSVG.src = chrome.runtime.getURL('assets/null.svg')
        Nodata.appendChild(NodataSVG)
        Nodata.appendChild(nodataText)
        return contentelement.appendChild(Nodata)
    }
    contentelement.innerHTML = ""
    data.forEach(element => {
        console.log(element.link)
        const containerElement = document.createElement('div')
        containerElement.classList.add('card')
        const header = document.createElement('div')
        header.classList.add('card-header')
        containerElement.appendChild(header)
        const linkLogo = document.createElement('div')
        linkLogo.classList.add('link-logo')
        header.appendChild(linkLogo)

        ///Icon
        const favicon = document.createElement('img')
        linkLogo.appendChild(favicon)
        favicon.src = "./Assets/link.png"

        const cardContainer = document.createElement('div')
        cardContainer.classList.add('card-container')
        header.appendChild(cardContainer)

        //Title
        const title = document.createElement('div')
        title.classList.add('link-title')
        title.innerText = element.tag

        title.addEventListener('click', () => {
            window.open(element.link, "_blank")
        })

        cardContainer.appendChild(title)
        const options_container = document.createElement('div')
        cardContainer.appendChild(options_container)
        /// Options
        const copy = document.createElement('img')
        copy.src = "./Assets/copy-outline.png"
        copy.classList.add('option-img')

        copy.onclick = () => {
            navigator.clipboard.writeText(element.link)
            copy.classList.add('copied')
            copy.src = "./Assets/copy-filled.png"
            setTimeout(() => {
                copy.src = "./Assets/copy-outline.png"
            }, 3000)
        }

        const star = document.createElement('img')
        star.src = element.favourite ? "./Assets/star-filled.png" : "./Assets/star-outline.png"
        star.classList.add('option-img')

        star.onclick = () => {
            element.favourite = !element.favourite
            star.src = element.favourite ? "./Assets/star-filled.png" : "./Assets/star-outline.png"
            chrome.storage.sync.get(['data'], result => {
                let newdata = result.data.map(e => {
                    if (e.link == element.link) {
                        e.favourite = !e.favourite
                    }
                    return e
                })
                chrome.storage.sync.set({ data: newdata }, () => {
                    console.log("Updated")
                })
            })
        }

        //Delete a link
        const delete_ = document.createElement('img')
        delete_.src = "./Assets/trash.svg"
        delete_.classList.add('option-img')

        delete_.onclick = () => {
            if (document.getElementById('title').innerText == "Deleted") {
                return
            }
            else{
                chrome.storage.sync.get(['data', 'deleted'], result => {
                    let newdata = result.data.filter(e => {
                        return e.link != element.link
                    })
                    let newdeleted = result.deleted ? [...result.deleted, element] : [element]
                    chrome.storage.sync.set({ data: newdata, deleted: newdeleted }, () => {
                        console.log("Updated")
                        load(newdata)
                    })
                })
            }
        }

        options_container.appendChild(copy)
        options_container.appendChild(star)
        options_container.appendChild(delete_)
        contentelement.appendChild(containerElement)

    });
}
chrome.storage.sync.get(['data'], result => {
    if (!result.data) {
        return load([])
    }
    data = result.data
    load(data)
})


//Navbar

document.getElementById('nav-open').onclick = () => {
    var title = document.getElementById('title').innerText
    if (title == "My Links") {
        document.getElementById("mySidenav").style.width = "200px";
    }
    else {
        chrome.storage.sync.get(['data'], result => result.data ? load(result.data) : null)
        document.getElementById('title').innerText = "My Links"
        document.getElementById('menu').src = "./Assets/menu.png"
    }

}
document.getElementById('nav-close').onclick = () => {
    document.getElementById("mySidenav").style.width = "0";
}

document.getElementById('favourites-nav').onclick = () => {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById('title').innerText = "Favourites"
    chrome.storage.sync.get(['data'], result => {
        let newdata = result.data.filter(e => {
            return e.favourite
        })
        load(newdata)
    })
    document.getElementById('menu').src = "./Assets/back.png"

}
document.getElementById('deleted-nav').onclick = () => {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById('title').innerText = "Deleted"
    chrome.storage.sync.get(['deleted'], result => {
        load(result.deleted)
        result.deleted != null || undefined ? load(result.deleted) : null
    })
    document.getElementById('menu').src = "./Assets/back.png"

}
document.getElementById('search-nav').onclick = () => {
    document.getElementById("search-container").style.display = "block";
}

document.getElementById('search-input').addEventListener('input', (event) => {
    console.log(event.target.value)
    let newdata = data.filter(e => {
        return e.tag.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1
    })
    load(newdata)
})
document.getElementById('github').onclick = () => window.open("https://github.com/NaveenkumarMD")
document.getElementById('about').onclick = () => window.open("https://mdnaveenkumar.web.app/")