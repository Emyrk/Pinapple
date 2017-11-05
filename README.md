## Inspiration

We wanted a quick and simple way to share files with our peers. Conventional methods like DropBox and GoogleDrive are excellent for persistent data storage and file sharing, while Pinapple is created for quick file transfers that do not persist much longer than the transfer itself.

## What it does

Pinapple serves as a proxy service for peers to communicate and share files. This means that the peer's data is never held on Pinapple servers, and the data stream is encrypted. Each peer's computer serves as the file server for file transfers, keeping your files private and secure. Because conventional services use their servers to store data, they impose data restrictions, while Pinapple allows the user to share as large, or as many files as possible.

## How we built it

We wanted to build a webapp so we didn't have to have users download anything aside from the files they share. This imposed some restrictions to how we could design things. Our backend a simple GoLang app that keeps track of which users are communicating to build data pipes for them to communicate. The same app also serves the webpage.

The frontend is where the meat of the project is. The frontend uses web sockets to communicate with its peers. There are 2 types of data pipes: data, and control. The control pipe keeps track of file location, file names, and other metadata to show the user. The data pipe is strictly for file transfers. The 2 pipe system ensures a data transfer doesn't freeze the app's ability to communicate.

The app was designed to be quick to use, therefore we decided to use Facebook as our authentication. Allowing users to quickly send files to other friends on the app. 

## Challenges we ran into

The biggest problem we ran into is the limitations browsers have interacting with disk. Most peer to peer file transfer services have much more control over the file system, whereas we were very limited. 

## Accomplishments that we're proud of

We are proud of our name. 

## What we learned

That we're pretty good at this kinda thing.

## What's next for Pinapple

Pinapple's future is short in it's current form. It's idea is excellent, but creating an app that has more control over the filesystem would allow for a lot of improvements. It would also give it the ability to easily expand, such as using BitTorrent for group file sharing.
