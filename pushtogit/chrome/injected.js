/******/ (function() { // webpackBootstrap
class PayCioWalletInjected {
    constructor() {
        this.isPayCio = true;
        this.chainId = '0x1';
        this.networkVersion = '1';
        this.selectedAddress = null;
        this.pendingRequests = new Map();
        this.eventHandlers = new Map();
        this.setupMessageListener();
        this.requestAccounts();
    }
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.source !== window)
                return;
            const { data } = event;
            if (data.type === 'PAYCIO_RESPONSE') {
                const { id, result, error } = data;
                const pending = this.pendingRequests.get(id);
                if (pending) {
                    this.pendingRequests.delete(id);
                    if (error) {
                        pending.reject(new Error(error.message));
                    }
                    else {
                        pending.resolve(result);
                    }
                }
            }
            if (data.type === 'PAYCIO_EVENT') {
                this.handleEvent(data.event, data.data);
            }
        });
    }
    handleEvent(eventName, eventData) {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            handlers.forEach(handler => handler(eventData));
        }
    }
    async requestAccounts() {
        try {
            const accounts = await this.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                this.selectedAddress = accounts[0];
                this.handleEvent('accountsChanged', accounts);
            }
        }
        catch (error) {
            console.error('Failed to get accounts:', error);
        }
    }
    isConnected() {
        return this.selectedAddress !== null;
    }
    async request(args) {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substring(7);
            this.pendingRequests.set(id, { resolve, reject });
            window.postMessage({
                type: 'PAYCIO_REQUEST',
                id,
                method: args.method,
                params: args.params || []
            }, '*');
            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }
    async enable() {
        const accounts = await this.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
            this.selectedAddress = accounts[0];
        }
        return accounts || [];
    }
    async send(method, params) {
        return this.request({ method, params });
    }
    sendAsync(payload, callback) {
        this.request({ method: payload.method, params: payload.params })
            .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
            .catch(error => callback(error, null));
    }
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }
    removeListener(event, handler) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
}
// Inject the wallet provider
const payCioWallet = new PayCioWalletInjected();
// Set up window.ethereum
if (!window.ethereum) {
    window.ethereum = payCioWallet;
}
else {
    console.warn('Another wallet provider is already installed');
}
// Set up window.web3 for legacy compatibility
if (!window.web3) {
    window.web3 = {
        currentProvider: payCioWallet
    };
}
console.log('PayCio Wallet injected script loaded');

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0ZWQuanMiLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixPQUFPO0FBQzNCO0FBQ0Esd0JBQXdCLG9CQUFvQjtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRCx3QkFBd0I7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLGlCQUFpQjtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBLDhDQUE4QywrQkFBK0I7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLGdCQUFnQjtBQUM5QztBQUNBO0FBQ0EsdUJBQXVCLGdEQUFnRDtBQUN2RSw2Q0FBNkMsd0NBQXdDO0FBQ3JGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGF5Y2lvLXdhbGxldC8uL3NyYy9pbmplY3RlZC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBQYXlDaW9XYWxsZXRJbmplY3RlZCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaXNQYXlDaW8gPSB0cnVlO1xuICAgICAgICB0aGlzLmNoYWluSWQgPSAnMHgxJztcbiAgICAgICAgdGhpcy5uZXR3b3JrVmVyc2lvbiA9ICcxJztcbiAgICAgICAgdGhpcy5zZWxlY3RlZEFkZHJlc3MgPSBudWxsO1xuICAgICAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnNldHVwTWVzc2FnZUxpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMucmVxdWVzdEFjY291bnRzKCk7XG4gICAgfVxuICAgIHNldHVwTWVzc2FnZUxpc3RlbmVyKCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZSAhPT0gd2luZG93KVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gZXZlbnQ7XG4gICAgICAgICAgICBpZiAoZGF0YS50eXBlID09PSAnUEFZQ0lPX1JFU1BPTlNFJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgaWQsIHJlc3VsdCwgZXJyb3IgfSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgY29uc3QgcGVuZGluZyA9IHRoaXMucGVuZGluZ1JlcXVlc3RzLmdldChpZCk7XG4gICAgICAgICAgICAgICAgaWYgKHBlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdHMuZGVsZXRlKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nLnJlamVjdChuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZy5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YS50eXBlID09PSAnUEFZQ0lPX0VWRU5UJykge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRXZlbnQoZGF0YS5ldmVudCwgZGF0YS5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGhhbmRsZUV2ZW50KGV2ZW50TmFtZSwgZXZlbnREYXRhKSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5ldmVudEhhbmRsZXJzLmdldChldmVudE5hbWUpO1xuICAgICAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzLmZvckVhY2goaGFuZGxlciA9PiBoYW5kbGVyKGV2ZW50RGF0YSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIHJlcXVlc3RBY2NvdW50cygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGFjY291bnRzID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHsgbWV0aG9kOiAnZXRoX2FjY291bnRzJyB9KTtcbiAgICAgICAgICAgIGlmIChhY2NvdW50cyAmJiBhY2NvdW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEFkZHJlc3MgPSBhY2NvdW50c1swXTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUV2ZW50KCdhY2NvdW50c0NoYW5nZWQnLCBhY2NvdW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZ2V0IGFjY291bnRzOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpc0Nvbm5lY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRBZGRyZXNzICE9PSBudWxsO1xuICAgIH1cbiAgICBhc3luYyByZXF1ZXN0KGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpO1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdHMuc2V0KGlkLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1BBWUNJT19SRVFVRVNUJyxcbiAgICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IGFyZ3MubWV0aG9kLFxuICAgICAgICAgICAgICAgIHBhcmFtczogYXJncy5wYXJhbXMgfHwgW11cbiAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICAvLyBUaW1lb3V0IGFmdGVyIDMwIHNlY29uZHNcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBlbmRpbmdSZXF1ZXN0cy5oYXMoaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3RzLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1JlcXVlc3QgdGltZW91dCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAzMDAwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYyBlbmFibGUoKSB7XG4gICAgICAgIGNvbnN0IGFjY291bnRzID0gYXdhaXQgdGhpcy5yZXF1ZXN0KHsgbWV0aG9kOiAnZXRoX3JlcXVlc3RBY2NvdW50cycgfSk7XG4gICAgICAgIGlmIChhY2NvdW50cyAmJiBhY2NvdW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQWRkcmVzcyA9IGFjY291bnRzWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2NvdW50cyB8fCBbXTtcbiAgICB9XG4gICAgYXN5bmMgc2VuZChtZXRob2QsIHBhcmFtcykge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KHsgbWV0aG9kLCBwYXJhbXMgfSk7XG4gICAgfVxuICAgIHNlbmRBc3luYyhwYXlsb2FkLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnJlcXVlc3QoeyBtZXRob2Q6IHBheWxvYWQubWV0aG9kLCBwYXJhbXM6IHBheWxvYWQucGFyYW1zIH0pXG4gICAgICAgICAgICAudGhlbihyZXN1bHQgPT4gY2FsbGJhY2sobnVsbCwgeyBpZDogcGF5bG9hZC5pZCwganNvbnJwYzogJzIuMCcsIHJlc3VsdCB9KSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBjYWxsYmFjayhlcnJvciwgbnVsbCkpO1xuICAgIH1cbiAgICBvbihldmVudCwgaGFuZGxlcikge1xuICAgICAgICBpZiAoIXRoaXMuZXZlbnRIYW5kbGVycy5oYXMoZXZlbnQpKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnMuc2V0KGV2ZW50LCBbXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzLmdldChldmVudCkucHVzaChoYW5kbGVyKTtcbiAgICB9XG4gICAgcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSB0aGlzLmV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50KTtcbiAgICAgICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcik7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBJbmplY3QgdGhlIHdhbGxldCBwcm92aWRlclxuY29uc3QgcGF5Q2lvV2FsbGV0ID0gbmV3IFBheUNpb1dhbGxldEluamVjdGVkKCk7XG4vLyBTZXQgdXAgd2luZG93LmV0aGVyZXVtXG5pZiAoIXdpbmRvdy5ldGhlcmV1bSkge1xuICAgIHdpbmRvdy5ldGhlcmV1bSA9IHBheUNpb1dhbGxldDtcbn1cbmVsc2Uge1xuICAgIGNvbnNvbGUud2FybignQW5vdGhlciB3YWxsZXQgcHJvdmlkZXIgaXMgYWxyZWFkeSBpbnN0YWxsZWQnKTtcbn1cbi8vIFNldCB1cCB3aW5kb3cud2ViMyBmb3IgbGVnYWN5IGNvbXBhdGliaWxpdHlcbmlmICghd2luZG93LndlYjMpIHtcbiAgICB3aW5kb3cud2ViMyA9IHtcbiAgICAgICAgY3VycmVudFByb3ZpZGVyOiBwYXlDaW9XYWxsZXRcbiAgICB9O1xufVxuY29uc29sZS5sb2coJ1BheUNpbyBXYWxsZXQgaW5qZWN0ZWQgc2NyaXB0IGxvYWRlZCcpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9