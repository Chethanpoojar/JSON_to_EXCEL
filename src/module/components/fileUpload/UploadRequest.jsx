import { TextField } from "@mui/material";
import { Field, Form } from "react-final-form";

const UploadRequest = () => {
  function validateJsonOrXml(text) {
    if (!text) {
      return "Required";
    }

    // if(!JSON.parse(text)){
    //     return "Not a Valid JSON";
    // }

    // if(!new window.DOMParser().parseFromString(text, "text/xml")){
    //     return "Not a Valid XML";
    // }

   

    try {
     var parser =  new window.DOMParser()
     parser.parseFromString(text, "text/xml");
    } catch (error) {
      return "Not a Valid XML";
    }

    // try {
    //   JSON.parse(text);
    // } catch (error) {
    //   return "Not a Valid JSON";
    // }

    // return "Invalid JSON or XML";
  }

  const onSubmit = (values) => {
    console.log(values); // Do something with the form values
  };

  return (
    <Form onSubmit={onSubmit}>
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <Field name="jsonOrXml" validate={validateJsonOrXml}>
            {({ input, meta }) => (
              <TextField
                {...input}
                fullWidth
                multiline
                rows={10}
                error={meta.touched && meta.error}
                helperText={meta.touched && meta.error}
                style={{ width: "25rem" }}
              />
            )}
          </Field>
          <button type="submit">Submit</button>
        </form>
      )}
    </Form>
  );
};

export default UploadRequest;
