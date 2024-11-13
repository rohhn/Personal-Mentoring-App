// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is

export const postVerify=async (content)=>
{
    if(content=="")
    {
        throw "Error, please enter something";
    }
    if(content==null)
    {
        throw "Error, please enter something";
    }
    if(typeof content !== "string")
    {
        throw "Erorr, post body must be a string";
    }
    content=content.trim();
    if(content.length==0)
    {
        throw "Error, post body cannot be empty";
    }
    if(content=="")
    {
        throw "Error, post body cannot be just empty spaces";
    }
}