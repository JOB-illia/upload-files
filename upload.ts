function bytesToSize(bytes: any) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (!bytes) return '0 Byte';
    // @ts-ignore
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    // @ts-ignore
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

const element = (tag: string, classes?: string[], content?: string) => {
    const node = document.createElement(tag);

    if (classes?.length) {
        node.classList.add(...classes);
    }

    if (content) {
        node.textContent = content;
    }

    return node;
}

function noop() {}

export const upload = (selector: string, options: {  multi: boolean, accept: string[], onUpload: (a: any, b: any) => void  }) => {
    let files: any = [];
    const onUpload = options.onUpload ?? noop;
    const input: HTMLInputElement | null = document.querySelector(selector);

    if (!input) return;

    const
        open = element('button', ['btn'], 'Открыть'),
        upload = element('button', ['btn', 'primary', 'hide'], 'Загрузить'),
        preview = element('div', ['preview']);


    if (options.multi) {
        input.setAttribute('multiple', 'true');
    }

    if (options.accept && Array.isArray(options.accept)) {
        input.setAttribute('accept', `${options.accept.join(',')}`)
    }

    input.insertAdjacentElement('afterend', preview );
    input.insertAdjacentElement('afterend', upload);
    input.insertAdjacentElement('afterend', open);



    const triggerInput = () => input.click();

    const changeHandler = (event: any) => {
        if (!event.target.files.length) return;

        files = Array.from(event.target.files);

        preview.innerHTML = '';
        upload.classList.remove('hide');

        files.forEach((file: any) => {
            if (!file.type.match('image')) return;

            const reader = new FileReader();

            reader.onload = ((ev: any) => {
                preview.insertAdjacentHTML('afterbegin', `
                    <div class="preview-image">
                        <div class="preview-remove" data-name="${file.name}">&times;</div>
                        <img src="${ev.target.result}" alt="${file.name}">
                        <div class="preview-info">
                            <span class="preview-info-name">${file.name}</span>
                            ${bytesToSize(file.size)}
                        </div>
                    </div>
                `)
            })

            reader.readAsDataURL(file);
        })
    }

    const handleRemoveButton = (event: any) => {
        if (!event.target.dataset.name) return;

        const { name } = event.target.dataset;
        files = files.filter((file: any) => file.name !== name);

        if (!files.length) {
            upload.classList.add('hide');
        }

        const block: any = preview.querySelector(`[data-name="${name}"]`)?.closest('.preview-image');

        block.classList.add('removing')
        setTimeout(() => {
            block.remove();
        }, 300)
    }

    const clearPreview = (el: any) => {
        el.style.bottom = 0;
        el.innerHTML = '<div class="preview-info-progress"> </div>'
    }

    const handleUpload = () => {
        preview.querySelectorAll('.preview-remove')?.forEach((el) => el.remove())
        const previewInfo = preview.querySelectorAll('.preview-info');

        previewInfo.forEach(clearPreview)
        onUpload(files, previewInfo)
    }

    open.addEventListener('click', triggerInput)
    input.addEventListener('change', changeHandler)
    preview.addEventListener('click', handleRemoveButton)
    upload.addEventListener('click', handleUpload)
}