
        // --- 1. GLOBAL UTILS & LOGGER ---
        function logEvent(message) {
            const logger = document.getElementById('logger-content');
            const time = new Date().toLocaleTimeString();
            if (logger.children.length === 1 && logger.children[0].classList.contains('italic')) {
                logger.innerHTML = '';
            }
            const entry = document.createElement('div');
            entry.className = "border-l-2 border-green-500 pl-2";
            entry.innerHTML = `<span class="text-slate-500 text-xs">[${time}]</span> <span class="text-green-300">${message}</span>`;
            logger.prepend(entry);
            console.log(`[QA DOJO] ${message}`);
        }

        function clearLog() {
            document.getElementById('logger-content').innerHTML = '<div class="text-slate-500 italic">Waiting for interactions...</div>';
        }

        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            const bgClass = type === 'success' ? 'bg-green-600' : 'bg-red-600';
            toast.className = `${bgClass} text-white px-6 py-3 rounded shadow-lg transform transition-all duration-300 translate-x-full opacity-0 flex items-center gap-2`;
            toast.innerHTML = `<i class="ph ph-${type === 'success' ? 'check-circle' : 'warning-circle'}"></i> ${message}`;
            
            container.appendChild(toast);
            
            // Animate in
            requestAnimationFrame(() => {
                toast.classList.remove('translate-x-full', 'opacity-0');
            });

            // Remove after 3s
            setTimeout(() => {
                toast.classList.add('translate-x-full', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // --- 2. AUTHENTICATION & NAVIGATION ---
        const loginForm = document.getElementById('login-form');
        const loginView = document.getElementById('login-view');
        const appLayout = document.getElementById('app-layout');
        const userDisplay = document.getElementById('user-display');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;

            if (u === 'admin' && p === 'password123') {
                loginView.classList.add('hidden');
                appLayout.classList.remove('hidden');
                userDisplay.textContent = u;
                showToast('Login Successful');
                logEvent(`User '${u}' logged in`);
            } else {
                document.getElementById('login-error').classList.remove('hidden');
                logEvent(`Failed login attempt: ${u}`);
            }
        });

        function logout() {
            appLayout.classList.add('hidden');
            loginView.classList.remove('hidden');
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('login-error').classList.add('hidden');
            logEvent('User logged out');
        }

        function showSection(sectionId) {
            document.querySelectorAll('.app-section').forEach(el => el.classList.add('hidden'));
            document.getElementById(`section-${sectionId}`).classList.remove('hidden');
            logEvent(`Mapsd to ${sectionId}`);
        }

        // --- 3. DASHBOARD LOGIC (TODOS) ---
        function addTodo() {
            const input = document.getElementById('new-todo');
            const text = input.value.trim();
            if (!text) return;

            const list = document.getElementById('todo-list');
            const li = document.createElement('li');
            li.className = "flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100 group";
            li.innerHTML = `
                <span class="todo-text">${text}</span>
                <button onclick="removeTodo(this)" class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"><i class="ph ph-trash"></i></button>
            `;
            list.appendChild(li);
            input.value = '';
            updateTaskCount(1);
            logEvent(`Added todo: ${text}`);
        }

        function removeTodo(btn) {
            btn.closest('li').remove();
            updateTaskCount(-1);
            logEvent('Removed todo item');
        }

        function updateTaskCount(change) {
            const el = document.getElementById('stat-tasks');
            let current = parseInt(el.innerText);
            el.innerText = Math.max(0, current + change);
        }

        // --- 4. SHOPPING CART LOGIC ---
        let cartTotal = 0;
        let cartCount = 0;

        function addToCart(item, price) {
            const list = document.getElementById('cart-items');
            const emptyMsg = list.querySelector('.empty-msg');
            if (emptyMsg) emptyMsg.remove();

            const li = document.createElement('li');
            li.className = "flex justify-between";
            li.innerHTML = `<span>${item}</span> <span>$${price}</span>`;
            list.appendChild(li);

            cartTotal += price;
            cartCount++;
            
            document.getElementById('cart-total').innerText = `$${cartTotal.toFixed(2)}`;
            document.getElementById('cart-count').innerText = cartCount;
            showToast(`${item} added to cart`);
            logEvent(`Added ${item} to cart`);
        }

        function checkout() {
            if (cartCount === 0) {
                showToast('Cart is empty!', 'error');
                return;
            }
            showToast(`Checkout successful! Total: $${cartTotal}`, 'success');
            logEvent(`Checkout processed for $${cartTotal}`);
            
            // Reset
            cartTotal = 0;
            cartCount = 0;
            document.getElementById('cart-items').innerHTML = '<li class="italic text-slate-400 empty-msg">Your cart is empty</li>';
            document.getElementById('cart-total').innerText = '$0.00';
            document.getElementById('cart-count').innerText = 0;
            
            // Update dashboard stat
            const orderStat = document.getElementById('stat-orders');
            orderStat.innerText = parseInt(orderStat.innerText) + 1;
        }

        // --- 5. SORTABLE TABLE LOGIC ---
        let sortDirection = 1; // 1 asc, -1 desc

        function sortTable(n) {
            const table = document.getElementById("users-table");
            let rows, switching, i, x, y, shouldSwitch, switchcount = 0;
            switching = true;
            
            // Reset icons
            table.querySelectorAll('i').forEach(i => i.className = 'ph ph-caret-up-down ml-1');
            const headerIcon = table.rows[0].getElementsByTagName("TH")[n].getElementsByTagName("i")[0];
            
            while (switching) {
                switching = false;
                rows = table.rows;
                for (i = 1; i < (rows.length - 1); i++) {
                    shouldSwitch = false;
                    x = rows[i].getElementsByTagName("TD")[n];
                    y = rows[i + 1].getElementsByTagName("TD")[n];
                    
                    let xVal = x.innerText.toLowerCase();
                    let yVal = y.innerText.toLowerCase();
                    // Check if numeric
                    if (!isNaN(parseFloat(xVal)) && !isNaN(parseFloat(yVal))) {
                        xVal = parseFloat(xVal);
                        yVal = parseFloat(yVal);
                    }

                    if (sortDirection == 1) {
                        if (xVal > yVal) { shouldSwitch = true; break; }
                    } else {
                        if (xVal < yVal) { shouldSwitch = true; break; }
                    }
                }
                if (shouldSwitch) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                    switchcount++;
                } else {
                    if (switchcount == 0 && sortDirection == 1) {
                        sortDirection = -1;
                        switching = true;
                    }
                }
            }
            // Update icon
            headerIcon.className = sortDirection === 1 ? 'ph ph-caret-up ml-1' : 'ph ph-caret-down ml-1';
            logEvent(`Table sorted by column ${n} (${sortDirection === 1 ? 'ASC' : 'DESC'})`);
        }

        function filterTable() {
            const input = document.getElementById("table-search");
            const filter = input.value.toUpperCase();
            const table = document.getElementById("users-table");
            const tr = table.getElementsByTagName("tr");

            for (let i = 1; i < tr.length; i++) {
                let found = false;
                const tds = tr[i].getElementsByTagName("td");
                for (let j = 0; j < tds.length; j++) {
                    if (tds[j]) {
                        if (tds[j].innerText.toUpperCase().indexOf(filter) > -1) {
                            found = true;
                            break;
                        }
                    }
                }
                tr[i].style.display = found ? "" : "none";
            }
        }

        // --- 6. UI ELEMENTS LOGIC ---
        function toggleDropdown() {
            const menu = document.getElementById('dropdown-menu');
            menu.classList.toggle('hidden');
        }

        function selectOption(opt) {
            document.getElementById('dropdown-selected').innerText = opt;
            document.getElementById('dropdown-menu').classList.add('hidden');
            logEvent(`Dropdown option selected: ${opt}`);
        }

        function updateRangeValue(val) {
            document.getElementById('range-value').innerText = val;
        }

        function openModal() {
            document.getElementById('simple-modal').classList.remove('hidden');
            logEvent('Modal opened');
        }

        function closeModal() {
            document.getElementById('simple-modal').classList.add('hidden');
            logEvent('Modal closed');
        }

        function confirmModal() {
            closeModal();
            showToast('Modal Confirmed');
            logEvent('Modal action confirmed');
        }

        // --- 7. ADVANCED SECTION LOGIC (Legacy) ---
        // Dynamic IDs
        document.addEventListener('DOMContentLoaded', () => {
            const randomId = 'dynamic-' + Math.random().toString(36).substr(2, 9);
            const dynamicInput = document.querySelector('section#dynamic input[type="checkbox"]');
            if(dynamicInput) {
                dynamicInput.id = randomId;
                console.log(`[QA Setup] Dynamic ID generated: #${randomId}`);
            }
        });

        // Waits
        function startLoad() {
            const btn = document.getElementById('start-load-btn');
            const loader = document.getElementById('loader');
            const container = document.getElementById('delayed-container');

            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            btn.innerText = 'Loading...';
            loader.classList.remove('hidden');

            setTimeout(() => {
                loader.classList.add('hidden');
                container.classList.remove('hidden');
                btn.innerText = 'Done';
                logEvent('Delayed element appeared in DOM');
            }, 3000);
        }

        // Shadow DOM
        document.addEventListener('DOMContentLoaded', () => {
            const host = document.getElementById('shadow-host');
            const shadowRoot = host.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.textContent = `
                .shadow-box { background: #334155; padding: 15px; border-radius: 8px; border: 1px solid #475569; }
                label { color: #e2e8f0; display: flex; align-items: center; gap: 10px; cursor: pointer; }
                input { width: 18px; height: 18px; accent-color: #3b82f6; }
                .note { margin-top: 5px; font-size: 0.8em; color: #94a3b8; }
            `;
            const div = document.createElement('div');
            div.className = 'shadow-box';
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.addEventListener('change', () => host.dispatchEvent(new CustomEvent('shadow-click', { bubbles: true, composed: true })));
            label.appendChild(input);
            label.appendChild(document.createTextNode('Shadow Checkbox'));
            const note = document.createElement('p');
            note.className = 'note';
            note.textContent = 'I exist inside a #shadow-root (open).';
            div.appendChild(style);
            div.appendChild(label);
            div.appendChild(note);
            shadowRoot.appendChild(div);
            host.addEventListener('shadow-click', () => logEvent('Shadow DOM Checkbox clicked'));
        });
        // Challenge 7: Console Hacker
        window.unlockSecretAgentMode = function() {
            const badge = document.getElementById('secret-agent-badge');
            const placeholder = document.getElementById('hacker-placeholder');
            
            if(badge && placeholder) {
                badge.classList.remove('hidden');
                badge.classList.add('secret-reveal');
                placeholder.classList.add('hidden');
                
                logEvent('SYSTEM HACKED: Secret Agent Mode Unlocked');
                console.log('%c ACCESS GRANTED ', 'background: #22c55e; color: #000; font-weight: bold; padding: 4px;');
                console.log('Félicitations ! Vous avez trouvé la fonction cachée.');
            } else {
                console.error("Erreur : Impossible de trouver les éléments secrets dans le DOM.");
            }
        };

