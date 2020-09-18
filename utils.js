exports.fileExtentionChecker = (fileName) => {
    const allowedExtentions = ['jpg', 'jpeg', 'gif', 'png'];
    const fileExtention = fileName.substr(-3);

    const isExtentionValid = allowedExtentions.includes(fileExtention);

    return isExtentionValid;
}

exports.lengthChecker = (text) => {
    const textLength = text.length;

    return textLength;
}

exports.textEscaper = (text) => {

    function signReplacer(sign) {
        switch(sign) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&guot;';
            case "'" :
                return '&#039;';       
        }
    }

    const pattern = /[&<>"']/g;
    const escapedText = text.replace(pattern, signReplacer);
    
    return escapedText;
}