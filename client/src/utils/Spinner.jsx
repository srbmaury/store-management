export default function Spinner({ text = "Loading..." }) {
    return (
        <div className="slds-spinner_container slds-align_absolute-center">
            <div role="status" className="slds-spinner slds-spinner_medium">
                <span className="slds-assistive-text">{text}</span>
                <div className="slds-spinner__dot-a"></div>
                <div className="slds-spinner__dot-b"></div>
            </div>
        </div>
    );
}
