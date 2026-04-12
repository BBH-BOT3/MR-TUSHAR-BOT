const axios = require('axios');
const fs = require('fs');
const path = require('path');


const versionFileUrl = 'https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan-Bot/main/version.json';
const githubRawBaseUrl = 'https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan-Bot/main/';
const autoupdatePackageUrl = 'https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan-Bot/main/package.json';
const autoupdatePackegeUrl = 'https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan-Bot/main/package.json';



function startLoading(message) {
    const dots = ['.', '..', '...'];
    let index = 0;
    process.stdout.write(`${message}`);

    const loadingInterval = setInterval(() => {
        process.stdout.write(`\r${message}${dots[index]}`);
        index = (index + 1) % dots.length;
    }, 300);

    return loadingInterval;
}


function stopLoading(loading, success, message) {
    clearInterval(loading);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(`${success ? '✔️' : '❌'} ${message}`);
}


async function updatePackageJson() {
    const loading = startLoading('Updating package.json');
    try {
        const response = await axios.get(autoupdatePackegeUrl);
        const contentToWrite = response.data;


        if (typeof contentToWrite === 'object') {

            const jsonString = JSON.stringify(contentToWrite, null, 2); 


            fs.writeFileSync(path.join(__dirname, 'package.json'), jsonString, 'utf-8');
            stopLoading(loading, true, 'package.json updated successfully.');
        } else {

            stopLoading(loading, false, 'Unexpected response format. Expected an object.');
            console.warn('Fetched content is not an object:', contentToWrite);
        }
    } catch (error) {
        stopLoading(loading, false, `Error updating package.json: ${error.message}`);
        if (error.response) {
            console.error(`HTTP error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            console.error('No response received from the server.');
        } else {
            console.error('Error:', error.message);
        }
    }
}


async function fetchVersionFile() {
    const loading = startLoading('Loading version file');
    try {
        const response = await axios.get(versionFileUrl);
        stopLoading(loading, true, 'Version file loaded successfully.');
        return response.data;
    } catch (error) {
        stopLoading(loading, false, 'Error fetching version.json');
        console.error(error.message);
        return [];
    }
}


async function fetchPackageJson() {
    const loading = startLoading('Loading package.json');
    try {
        const response = await axios.get(autoupdatePackageUrl);
        stopLoading(loading, true, 'package.json loaded successfully.');
        return response.data;
    } catch (error) {
        stopLoading(loading, false, 'Error fetching package.json');
        console.error(error.message);
        return null;
    }
}


function getLatestVersion(versions) {
    return versions.reduce((latest, versionInfo) => {
        return versionInfo.version > latest ? versionInfo.version : latest;
    }, versions[0].version);
}


async function fetchFileContent(filePath) {
    try {
        const fileUrl = `${githubRawBaseUrl}${filePath}`;
        const response = await axios.get(fileUrl);
        return response.data;
    } catch (error) {
        console.warn(`Warning: Could not fetch file content from GitHub for ${filePath}. Creating with default notice.`);
        return null;
    }
}
function deleteFile(filePath, notice) {
    const fullFilePath = path.join(__dirname, filePath);
    const loading = startLoading(`Deleting file: ${filePath}`);
    setTimeout(() => {
        if (fs.existsSync(fullFilePath)) {
            fs.unlinkSync(fullFilePath);
            stopLoading(loading, true, `Deleted file: ${filePath}\nNotice: ${notice}`);
        } else {
            stopLoading(loading, false, `File not found, could not delete: ${filePath}`);
        }
    }, 500);
}
async function updateFiles(versions, currentVersion) {


    const latestVersionInfo = versions.find(versionInfo => versionInfo.version === currentVersion);


   if (latestVersionInfo && latestVersionInfo.deleteFiles) {
       for (const [filePath, fileNotice] of Object.entries(latestVersionInfo.files)) {
            const deleteFiles = latestVersionInfo.deleteFiles;
            for (const [filePath, fileNotice] of Object.entries(deleteFiles)) {
                console.log(`\nDeleting file: ${filePath}\nNotice: ${fileNotice}`);
                deleteFile(filePath, fileNotice);
            }
        }
   }

    if (latestVersionInfo && latestVersionInfo.files) {
        console.log(`Updating files for version: ${currentVersion}`);

        for (const [filePath, fileNotice] of Object.entries(latestVersionInfo.files)) {
            const fullFilePath = path.join(__dirname, filePath);
            const loading = startLoading(`Updating/Creating file: ${filePath}`);

            try {

                const fileContent = await fetchFileContent(filePath);
                const contentToWrite = fileContent 
                    ? `${fileContent}`
                    : `${fileNotice}`;


                if (!fs.existsSync(fullFilePath)) {
                    const dirPath = path.dirname(fullFilePath);
                    fs.mkdirSync(dirPath, { recursive: true });
                    fs.writeFileSync(fullFilePath, contentToWrite, 'utf-8');
                    stopLoading(loading, true, `Created file: ${filePath}\nNotice: ${fileNotice}\n`);
                } else {

                    fs.writeFileSync(fullFilePath, contentToWrite, 'utf-8');
                    stopLoading(loading, true, `Updated file: ${filePath}\nNotice: ${fileNotice}\n`);
                }
            } catch (error) {
                stopLoading(loading, false, `Error updating/creating file: ${filePath}`);
                console.error(error.message);
            }
        }
    } else {
        console.log(`No matching version found in version.json for version: ${currentVersion}. No updates applied.`);
    }
}


(async () => {
    const versions = await fetchVersionFile(); 
    const currentPackageJson = await fetchPackageJson(); 

    if (currentPackageJson) {
        const currentVersion = currentPackageJson.version;
        const v = require("./package.json")
    const vv = v.version
    if (vv == currentVersion){
        console.log("✔️ You are using the latest version")
    } else {


        await updateFiles(versions, currentVersion);
        await updatePackageJson();
    }
    }
})();
