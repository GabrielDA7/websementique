import React, {useState} from "react";

const ModalContext = React.createContext(null);
ModalContext.displayName = "ModalContext";

function ModalProvider(props) {
    const [data, setData] = useState({
        node: {},
        show: false
    });

    const showModal = React.useCallback((node) => {
        setData({node: node, show: true});
    }, [setData]);

    const closeModal = React.useCallback(() => {
        setData({node: {}, show: false});
    }, [setData]);

    const providerValue = React.useMemo(
        () => ({ data, showModal, closeModal }),
        [data, showModal, closeModal]
    );

    return <ModalContext.Provider value={providerValue} {...props} />;
}

function useModal() {
    return React.useContext(ModalContext);
}

export { ModalProvider, useModal };
