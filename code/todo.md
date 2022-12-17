# TODO
- [] Resource manager transfer test: 
    - [] TODO: Test when agents don't already exist (neg)
    - [] TODO: Negative tests where the transfer fails
    - [] TODO: Test også når man overfører en type som modtageren allerede ejer (så skal den slå dem sammen).
- [] Transformation tests:
    - [] TODO: Test that the locations are accurate.
    - [] TODO: Test that all inputs must have the same location.
    - [] TODO: Test that no location is added
- [X] Når man tilføjer to af samme resource type til en agent så sletter den den første sat ind, fiks det. 
- [x] Fix nogle af testfejlene. 
- [x] Rette uid med Resource_Type typen. 
- [x] Fjern signature field i transport, transfer, transformation tabels
- [X] Store ownerships in the database (currently only stored in ownershipstate). 
- [X] Implement transfer in ResourceManager.
    - [X] Check that the transfer is valid (both ownership, creditlimit and zerosum).
    - [X] if valid, subtract and add the resources transferred. 
    - [X] Update database
    - [X] Update ownershipstate
- [X] Implement the repositories.
- [X] Modify the Service to use repositories. 
- [X] Possibly divide service.ts into multiple files.
- [x] Automatically make framework copy everything in database/ to dist/src/database. Right now we have to do it manually to make things run. (OBS! Det er ikke nødvendigt -- tests kører alligevel fordi de har den rette sti angivet.)
- [] Make an index file for testing that connects all tests, so only have to
  specify this one i package.json: https://stackoverflow.com/questions/24153261/joining-tests-from-multiple-files-with-mocha-js
- [x] sæt tilbage i package.json  mocha --timeout 5000 --exit dist/test/api.js &&
- [] Ryd op i sql filer (fjern eksempelvis createTransferConfirmation)
- [X] Fjern transferconfirmation fra hele koden. 
- [X] Ryd op i types.ts
- [] Implement proper error types and handling (ligesom DanAlex)


## Larger missing parts

- [X] Implementer Transformation (fra bunden).
- [X] Implementer Transport (fra bunden).
- [X] Implementer Carbon Credits (fra bunden).
- [X] Implementer Vector interfacet + objekt.
- [X] Lav en dummy til Areal/Location.
- [X] Implementer de manglende API kald (se todo.md, men flere kan tilføjes).
- [] Implementer en rigtig SHA nøgle til Agent.key. Make a SSH key for the agents (right now just a random string).
- [X] I testen 'should be able to transfer resources', tilføj tjek der sikre at sender ikke længere
     ejer den transfered resource og at receiver nu ejer den (ift holding/ownership).
- [X] DB setup skal virke fra init.sh
- [X] Vi skal have tilføjet noget, der indikerer at en agent har rettigheder til at tilføje resourcer til systemet. Måske? For at der ikke kommer resourcer ud af ingenting

## Done

- [X] Lav interfaces på en god måde (evt. slet klasserne igen).
- [X] Timestamps skal genereres inde i koden. ikke gives af brugeren. Tjek date med timezone.
- [X] Del test/api.ts op i flere filer. And in more `describe()` methods.
- [X] Pause/sleep function for setup in tests
- [x] Look into GET functions and whether to use `return res.send()` or just `res.send()`
	- The return keyword returns from your function, ending its execution. Any lines of code after it will not be executed.
	Sometimes you want to use res.send and then do other stuff.
- [O] Split POST, GET into several files for better organisation. (Don't think it is necessary now)
	- [X] Move everything database related to services.ts, so routes.ts only is about the API (which should know nothing about the database)
- [x] Look into JSON curl for testing.
	- curl -X POST -d '{transferor: "linuxize", transferee: "hello", timestamp:"0907090801", info: {"apples":"linuxize@example.com"}}' http://localhost:3002/api/transfer
	- curl --request POST -H "Content-Type: application/json" -d '{"transferee": "cami", "transferor": "farmerboy", "timestamp": "her", "inputs": {"some": "her"}}' localhost:3002/api/transfer


## Notes for future work and report inclusions

- Implementing Transport_Confirmation and Transfer_Confirmation would be nice to have to mimik real-world action, however, for this thesis it is superfluous in terms of demonstrating the framework and adds complexity to the system. For future work, it is easy to extend to the framework. 
- Elaborate area compution for checking overlapping areas in carbon credits. 

## Functionalities

**Agents**
- [x] createAgent (post)
- [x] Get all agents (get)
- [x] Look up agents based on ID (get)
- [] Look up resource holding based on ID (get)

**Transfers**
- [x] createTransfer (post)
- [] Look up a transfer based on a transfer ID (get)
- [] Look up transfers based on an agent ID (get)
- [] Look up pending transfers based on an agent ID (get)
- [] Get all resources (products) based on a transfer ID (get)
- [] Get all transfers based on time range (get)

**Resource types**
- [x] addResourceType (post)
- [x] getResourceTypes (get)

**Resources**
- [x] createResource
- [x] getResources (get)
- [x] getResource based on ID

**Transformations**
- [X] createTransformation (post)
- [X] Look up a transformation based on a transformation ID (get)
