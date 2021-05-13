# Ombi x Senscritique 

Request movies and tv shows wished on SensCritique on Ombi.

Only user/password authentication is supported for now. 

## Installation

### Docker

```
docker pull nitrikx/ombi-senscritique
```

### From source

```bash
git clone https://github.com/NitriKx/ombi-senscritique.git
cd ombi-senscritique
npm i 
npm run build
npm run start:prod
```

## Configuration 

```
curl -H "Content-Type: application/json" --data '{"scheduling": "0 */5 * * * *", "languageCode": "FR", "ombiUrl": "https://myombi.io", "ombiApiKey": "2211146ccc2246ef8cd4abcd37255dc3", "sensCritiqueUserEmail": "foo@bar.com", "sensCritiqueUserPassword": "myStrongPassword" }' http://localhost:3582/api/v1/configuration
```

| Name | Description | Default value |
| ---- | ----------- | ------------- |
| scheduling | The frequency of synchronization between Ombi and SensCritique | 0 */5 * * * * |
| languageCode | The language code when searching for a movie on ombi. Usually FR as SensCritique is referencing movies in french | FR |
| ombiUrl | Your Ombi base URL. | N/A |
| ombiApiKey | Your Ombi API Key. | N/A |
| sensCritiqueUserEmail | Your SensCritique email | N/A |
| sensCritiqueUserPassword | Your SensCritique password | N/A |


## Credits

Thanks to [LinuxServer.io](https://github.com/linuxserver) for the Docker image framework. 