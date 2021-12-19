class ObservableValue {
  observers = [];
  value = undefined;
  constructor(value) {
    this.value = value;
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  removeObserver(observer) {
    const index = this.observers.findIndex((o) => o === observer);
    this.observers.splice(index, 0, 1);
  }
  trigger() {
    this.observers.forEach((observer) => observer());
  }
}

const globalState = {
  trackingObserver: undefined,
};

const $mobx = Symbol("mobx administration");
function observable(instance) {
  const mobxAdmin = {};
  Object.defineProperty(instance, $mobx, {
    enumerable: false,
    writable: true,
    configurable: true,
    value: mobxAdmin,
  });
  for (const key in instance) {
    const value = instance[key];
    mobxAdmin[key] = new ObservableValue(value);

    Object.defineProperty(instance, key, {
      configurable: true,
      enumerable: true,
      get() {
        const observableValue = instance[$mobx][key];
        const observer = globalState.trackingObserver;
        if (observer) {
          observableValue.addObserver(observer);
        }
        return observableValue.value;
      },
      set(value) {
        instance[$mobx][key].value = value;
        instance[$mobx][key].trigger();
      },
    });
  }

  return instance;
}

function autorun(observer) {
  globalState.trackingObserver = observer;
  observer();
  globalState.trackingObserver = undefined;
}

const message = observable({
  title: "title-01",
});

autorun(() => {
  console.log(message.title);
});

message.title = "title-02";
message.title = "title-03";
