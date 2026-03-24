// Dynamic File System State
let files = {};
let currentFile = null;
let openFiles = [];
let editor = null;
let fileTree = [];

// Helpers
function getFileIcon(filename) {
    if (filename.endsWith('.html')) return { color: '#e34c26', class: 'fa-html5' };
    if (filename.endsWith('.css')) return { color: '#264de4', class: 'fa-css3-alt' };
    if (filename.endsWith('.js')) return { color: '#f7df1e', class: 'fa-js' };
    if (filename.endsWith('.json')) return { color: '#cb3837', class: 'fa-js' };
    if (filename.endsWith('.php')) return { color: '#777bb3', class: 'fa-php' };
    if (filename.match(/\.(png|jpg|jpeg|gif|svg|ico)$/i)) return { color: '#a0a0a0', class: 'fa-image' };
    return { color: '#cccccc', class: 'fa-file' };
}

function getLanguage(filename) {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.php')) return 'php';
    return 'plaintext';
}

function isEditable(filename) {
    return !filename.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar)$/i);
}

// Load Tree from server
async function loadTree() {
    try {
        let basePath = '';
        let targetParam = '';
        const match = window.location.pathname.match(/\/(\d{2})\/?(?:index\.html)?$/);
        if (match) {
            const num = match[1];
            basePath = '../';
            targetParam = `&target=src${num}`;
        }

        const res = await fetch(`${basePath}list.php?t=${Date.now()}${targetParam}`);
        fileTree = await res.json();

        const container = document.getElementById('file-list').parentNode;
        const oldList = document.getElementById('file-list');
        if (oldList) oldList.remove();

        const ul = renderSidebarTree(fileTree, 0);
        ul.id = 'file-list';
        container.appendChild(ul);

        // Ensure initial file is open
        if (!currentFile) {
            const initialFile = match ? `src${match[1]}/index.html` : 'src/index.html';
            openFileAction(initialFile, 'index.html', getFileIcon('index.html'));
        }
    } catch (e) {
        console.error('Failed to load file tree', e);
    }
}

// Render Sidebar (Recursive)
function renderSidebarTree(nodes, depth) {
    const ul = document.createElement('ul');
    ul.className = depth === 0 ? 'file-list' : 'file-list-nested';
    ul.style.listStyle = 'none';
    if (depth > 0) ul.style.paddingLeft = '0px';

    nodes.forEach(node => {
        const li = document.createElement('li');
        const paddingLeft = 10 + depth * 15;

        if (node.type === 'folder') {
            const div = document.createElement('div');
            div.className = 'file-item folder';
            div.style.padding = `4px 10px 4px ${paddingLeft}px`;
            div.style.cursor = 'pointer';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '8px';
            div.style.color = '#ccc';
            div.innerHTML = `<i class="fa-regular fa-folder" style="color: #dcb67a;"></i> ${node.name}`;
            li.appendChild(div);

            const childrenContainer = renderSidebarTree(node.children, depth + 1);
            childrenContainer.style.display = 'none';
            li.appendChild(childrenContainer);

            div.addEventListener('click', (e) => {
                e.stopPropagation();
                const icon = div.querySelector('i');
                if (childrenContainer.style.display === 'none') {
                    childrenContainer.style.display = 'block';
                    icon.className = 'fa-regular fa-folder-open';
                } else {
                    childrenContainer.style.display = 'none';
                    icon.className = 'fa-regular fa-folder';
                }
            });
        } else {
            const iconInfo = getFileIcon(node.name);
            const div = document.createElement('div');
            div.className = 'file-item';
            div.setAttribute('data-file', node.path);
            div.style.padding = `4px 10px 4px ${paddingLeft}px`;
            div.style.cursor = 'pointer';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '8px';
            div.style.color = '#ccc';
            div.innerHTML = `<i class="fa-solid ${iconInfo.class}" style="color: ${iconInfo.color};"></i> ${node.name}`;
            li.appendChild(div);

            div.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isEditable(node.name)) {
                    openFileAction(node.path, node.name, iconInfo);
                } else {
                    alert('このファイルはエディタで開けません。');
                }
            });
        }
        ul.appendChild(li);
    });
    return ul;
}

// Open File Action
async function openFileAction(path, name, iconInfo) {
    if (!files[path]) {
        try {
            let basePath = '';
            const match = window.location.pathname.match(/\/(\d{2})\/?(?:index\.html)?$/);
            if (match) basePath = '../';

            const res = await fetch(basePath + path + '?t=' + Date.now());
            if (!res.ok) throw new Error('Network error');
            const content = await res.text();
            files[path] = {
                language: getLanguage(name),
                content: content,
                savedContent: content,
                isDirty: false,
                name: name,
                path: path,
                iconColor: iconInfo.color,
                iconClass: iconInfo.class,
                model: null
            };
        } catch (e) {
            console.error(e);
            alert('ファイルの読み込みに失敗しました。');
            return;
        }
    }
    switchFile(path);
}

// Render Tabs
function renderTabs() {
    const tabsContainer = document.getElementById('editor-tabs');
    tabsContainer.innerHTML = '';

    openFiles.forEach(fileKey => {
        const file = files[fileKey];
        const tab = document.createElement('div');
        tab.className = `editor-tab ${currentFile === fileKey ? 'active' : ''} ${file.isDirty ? 'dirty' : ''}`;

        const dirtyIndicator = file.isDirty ? ' *' : '';
        tab.innerHTML = `
            <div class="tab-title-wrapper">
                <i class="fa-solid ${file.iconClass}" style="color: ${file.iconColor};"></i>
                <span class="tab-title">${file.name}${dirtyIndicator}</span>
            </div>
            <div class="tab-close" data-key="${fileKey}" title="Close">
                <i class="fa-solid fa-xmark"></i>
            </div>
        `;

        tab.addEventListener('click', (e) => {
            if (e.target.closest('.tab-close')) return;
            switchFile(fileKey);
        });

        tab.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeFile(fileKey);
        });

        tabsContainer.appendChild(tab);
    });
}

// Switch File
function switchFile(fileKey) {
    if (!openFiles.includes(fileKey)) {
        openFiles.push(fileKey);
    }
    currentFile = fileKey;

    document.querySelectorAll('.file-item:not(.folder)').forEach(i => i.classList.remove('active'));
    // Since id may contain slashes, we use Attribute Selector
    const activeSidebarItem = document.querySelector(`.file-item[data-file="${fileKey}"]`);
    if (activeSidebarItem) {
        activeSidebarItem.classList.add('active');
    }

    // Create/Reuse Model
    if (editor) {
        const file = files[fileKey];
        if (!file.model) {
            file.model = monaco.editor.createModel(file.content, file.language);
        }
        editor.setModel(file.model);
    }

    renderTabs();
}

// Close File
function closeFile(fileKey) {
    const file = files[fileKey];
    if (file.isDirty) {
        if (!confirm('保存していませんが大丈夫ですか？変更内容が失われます。')) {
            return;
        }
        file.content = file.savedContent;
        file.isDirty = false;
        if (file.model) {
            file.model.setValue(file.savedContent);
        }
    }

    openFiles = openFiles.filter(k => k !== fileKey);

    if (currentFile === fileKey) {
        if (openFiles.length > 0) {
            switchFile(openFiles[openFiles.length - 1]);
        } else {
            currentFile = null;
            if (editor) editor.setModel(null);
            renderTabs();
            document.querySelectorAll('.file-item:not(.folder)').forEach(i => i.classList.remove('active'));
        }
    } else {
        renderTabs();
    }
}

// Init Monaco
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    const editorContainer = document.getElementById('editor-container');
    editor = monaco.editor.create(editorContainer, {
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        padding: { top: 15 }
    });

    editor.onDidChangeModelContent(() => {
        if (!currentFile) return;
        const newValue = editor.getValue();
        files[currentFile].content = newValue;
        if (newValue !== files[currentFile].savedContent) {
            if (!files[currentFile].isDirty) {
                files[currentFile].isDirty = true;
                renderTabs();
            }
        } else {
            if (files[currentFile].isDirty) {
                files[currentFile].isDirty = false;
                renderTabs();
            }
        }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
        saveFile();
    });

    // Load file tree initially
    loadTree();
});

// Preview & Save Logic
async function reloadPreview() {
    let basePath = '';
    let targetDir = 'src';
    const match = window.location.pathname.match(/\/(\d{2})\/?(?:index\.html)?$/);
    if (match) {
        basePath = '../';
        targetDir = `src${match[1]}`;
    }

    try {
        const promises = [];
        for (const key in files) {
            // Check if file is inside src before fetching cache, though here the key IS the path
            promises.push(fetch(basePath + key + '?t=' + Date.now(), { cache: 'reload' }).catch(e => { }));
        }
        await Promise.all(promises);
    } catch (e) { }

    const iframe = document.getElementById('preview-frame');
    if (iframe) {
        // 現在プレビューされているファイルパスを維持しつつリロードする
        const currentSrc = iframe.src;
        let targetFile = basePath + targetDir + '/index.html';
        
        // もしすでに何か別の画面(drink.htmlなど)を開いていたら、それを優先する
        try {
            if (iframe.contentWindow && iframe.contentWindow.location) {
                const url = new URL(iframe.contentWindow.location.href);
                // パスのみを取得して、ベースの URL などを除外
                if (url.pathname.includes(targetDir)) {
                    targetFile = url.pathname + url.search;
                }
            }
        } catch(e) {
            // クロスオリジンなどでアクセスできない場合は無視
        }
        
        // クエリストリングが存在するかどうかで '?' か '&' を使い分ける
        const separator = targetFile.includes('?') ? '&' : '?';
        
        // キャッシュバスターを付与（あるいは更新）して再読み込み
        // targetFileから既存のt=xxxパラメータを除去
        const cleanTargetFile = targetFile.replace(/([?&])t=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');
        const newSeparator = cleanTargetFile.includes('?') ? '&' : '?';

        iframe.src = cleanTargetFile + newSeparator + 't=' + Date.now();
    }
}

document.getElementById('refresh-btn').addEventListener('click', () => reloadPreview());

async function saveFile() {
    if (!currentFile) return;
    const btn = document.getElementById('save-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        let basePath = '';
        const match = window.location.pathname.match(/\/(\d{2})\/?(?:index\.html)?$/);
        if (match) basePath = '../';

        const base64Content = btoa(unescape(encodeURIComponent(files[currentFile].content)));

        const response = await fetch(basePath + 'save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: files[currentFile].path,
                content: base64Content
            })
        });

        if (response.ok) {
            btn.innerHTML = '<i class="fa-solid fa-check" style="color: #4CAF50;"></i> Saved!';
            setTimeout(() => { btn.innerHTML = originalText; }, 2000);

            files[currentFile].savedContent = files[currentFile].content;
            files[currentFile].isDirty = false;
            renderTabs();

            reloadPreview();
        } else {
            const err = await response.text();
            throw new Error(err);
        }
    } catch (e) {
        console.error(e);
        btn.innerHTML = '<i class="fa-solid fa-xmark" style="color: #f44336;"></i> Error';
        setTimeout(() => { btn.innerHTML = originalText; }, 3000);
        alert('保存に失敗しました。詳細: ' + e.message);
    }
}

if (document.getElementById('save-btn')) {
    document.getElementById('save-btn').addEventListener('click', saveFile);
}


// --- Zoom Controls ---
let editorZoom = 100;
let previewZoom = 100;

function updateEditorZoom() {
    const el = document.getElementById('editor-zoom-level');
    if (el) el.textContent = editorZoom + '%';
    if (typeof editor !== 'undefined' && editor && editor.updateOptions) {
        const baseFontSize = 14;
        const newFontSize = Math.max(8, Math.round(baseFontSize * (editorZoom / 100)));
        editor.updateOptions({ fontSize: newFontSize });
    }
}

function updatePreviewZoom() {
    const el = document.getElementById('preview-zoom-level');
    const iframe = document.getElementById('preview-frame');
    if (el) el.textContent = previewZoom + '%';
    if (iframe) {
        const scale = previewZoom / 100;
        iframe.style.transform = 'scale(' + scale + ')';
        iframe.style.transformOrigin = 'top left';
        iframe.style.width = (100 / scale) + '%';
        iframe.style.height = (100 / scale) + '%';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#editor-zoom-in')) {
            if (editorZoom < 300) editorZoom += 10;
            updateEditorZoom();
        }
        if (e.target.closest('#editor-zoom-out')) {
            if (editorZoom > 50) editorZoom -= 10;
            updateEditorZoom();
        }
        if (e.target.closest('#preview-zoom-in')) {
            if (previewZoom < 300) previewZoom += 10;
            updatePreviewZoom();
        }
        if (e.target.closest('#preview-zoom-out')) {
            if (previewZoom > 50) previewZoom -= 10;
            updatePreviewZoom();
        }
    });

    const iframe = document.getElementById('preview-frame');
    if (iframe) {
        iframe.addEventListener('load', () => {
            updatePreviewZoom();
        });
    }
});
